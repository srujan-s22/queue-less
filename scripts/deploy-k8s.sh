#!/usr/bin/env bash
# =============================================================================
# QueueLess — Kubernetes Safe Deployment & Coordinated Rollback Automation
# Phase 6.4 Deliverable
# =============================================================================
set -euo pipefail

# -----------------------------------------------------------------------------
# CONSTANTS & CONFIGURATION
# -----------------------------------------------------------------------------
TARGET_NAMESPACE="queueless"
REQUIRED_CONTEXT="minikube"
DEFAULT_REGISTRY="srujans22"
DEFAULT_TIMEOUT="120s"
SCRIPT_NAME="$(basename "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------
log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

print_usage() {
  cat <<EOF
Usage: ${SCRIPT_NAME} [OPTIONS] <IMAGE_TAG_OR_SHA>

Automated safe deployment script for QueueLess application services in Minikube.
Modifies ONLY application container images via 'kubectl set image'.

Arguments:
  <IMAGE_TAG_OR_SHA>          Full 40-character commit SHA or 'sha-<40-hex>' tag.
                              (e.g., 3585c22bb2ff9ecc09439c8374a7dcbf5fd7f256)

Options:
  -r, --registry <NAME>       Docker Hub registry prefix (default: ${DEFAULT_REGISTRY})
  -t, --timeout <DURATION>    Rollout timeout duration (default: ${DEFAULT_TIMEOUT})
      --dry-run               Execute pre-flight checks and validate images without mutating cluster
  -h, --help                  Display this help message and exit

Safety Guarantees:
  - Strictly locked to Minikube context and 'queueless' namespace.
  - Rejects 'latest' tags unconditionally.
  - Modifies only container images in deployment/backend, frontend, worker.
  - MongoDB StatefulSet and PVC are strictly protected and never touched.
  - Mandatory reverse-order coordinated rollback restores exact baseline images on failure.
  - Worker singleton protection: Replicas must equal 1 and strategy must equal Recreate.
  - Fail-closed worker heartbeat: Requires pre-existing healthy heartbeat baseline before mutating.
  - Guarded signal traps handle SIGINT/SIGTERM/SIGHUP safely during mutations.
EOF
}

# -----------------------------------------------------------------------------
# STEP 1: ARGUMENT PARSING & FAIL-CLOSED VALIDATION
# -----------------------------------------------------------------------------
INPUT_TAG=""
REGISTRY="${DEFAULT_REGISTRY}"
TIMEOUT="${DEFAULT_TIMEOUT}"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -r|--registry)
      if [[ $# -lt 2 || -z "$2" || "$2" == -* ]]; then
        log_error "Option '$1' requires a non-empty argument."
        print_usage
        exit 1
      fi
      REGISTRY="$2"
      shift 2
      ;;
    -t|--timeout)
      if [[ $# -lt 2 || -z "$2" || "$2" == -* ]]; then
        log_error "Option '$1' requires a non-empty argument."
        print_usage
        exit 1
      fi
      TIMEOUT="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    -*)
      log_error "Unsupported option: '$1'."
      print_usage
      exit 1
      ;;
    *)
      if [ -n "${INPUT_TAG}" ]; then
        log_error "Duplicate positional argument detected: '$1'. Target SHA was already set to '${INPUT_TAG}'."
        print_usage
        exit 1
      fi
      INPUT_TAG="$1"
      shift
      ;;
  esac
done

if [ -z "${INPUT_TAG}" ]; then
  log_error "Missing required positional argument: <IMAGE_TAG_OR_SHA>."
  print_usage
  exit 1
fi

# Reject latest explicitly
if [[ "${INPUT_TAG}" == "latest" || "${INPUT_TAG}" == latest:* ]]; then
  log_error "Deployment of 'latest' is strictly prohibited. Production deployments must use full-SHA tags."
  exit 1
fi

# Validate and normalize commit SHA
CLEAN_SHA=""
if [[ "${INPUT_TAG}" =~ ^sha-([0-9a-f]{40})$ ]]; then
  CLEAN_SHA="${BASH_REMATCH[1]}"
elif [[ "${INPUT_TAG}" =~ ^[0-9a-f]{40}$ ]]; then
  CLEAN_SHA="${INPUT_TAG}"
else
  log_error "Invalid tag format '${INPUT_TAG}'. Must be a full 40-character hexadecimal commit SHA or 'sha-<40-hex>'."
  exit 1
fi

FULL_SHA_TAG="sha-${CLEAN_SHA}"

# Validate timeout syntax
if [[ ! "${TIMEOUT}" =~ ^[1-9][0-9]*s?$ ]]; then
  log_error "Invalid timeout value '${TIMEOUT}'. Must be a positive integer or duration (e.g. 120 or 120s)."
  exit 1
fi
if [[ ! "${TIMEOUT}" =~ s$ ]]; then
  TIMEOUT="${TIMEOUT}s"
fi

# Validate registry syntax
if [[ ! "${REGISTRY}" =~ ^[a-zA-Z0-9_.-]+(/[a-zA-Z0-9_.-]+)?$ ]]; then
  log_error "Invalid registry prefix '${REGISTRY}'. Must be a valid non-empty registry or namespace identifier."
  exit 1
fi

# Build target image references
BACKEND_TARGET_IMAGE="${REGISTRY}/queueless-backend:${FULL_SHA_TAG}"
FRONTEND_TARGET_IMAGE="${REGISTRY}/queueless-frontend:${FULL_SHA_TAG}"
WORKER_TARGET_IMAGE="${REGISTRY}/queueless-worker:${FULL_SHA_TAG}"

echo "=========================================================="
echo " QueueLess Kubernetes Safe Deployment Automation          "
echo "=========================================================="
log_info "Target Namespace: ${TARGET_NAMESPACE}"
log_info "Enforced Context: ${REQUIRED_CONTEXT}"
log_info "Commit SHA      : ${CLEAN_SHA}"
log_info "Deployment Tag  : ${FULL_SHA_TAG}"
log_info "Backend Image   : ${BACKEND_TARGET_IMAGE}"
log_info "Frontend Image  : ${FRONTEND_TARGET_IMAGE}"
log_info "Worker Image    : ${WORKER_TARGET_IMAGE}"
log_info "Rollout Timeout : ${TIMEOUT}"
log_info "Dry Run Mode    : ${DRY_RUN}"
echo "=========================================================="

# -----------------------------------------------------------------------------
# STEP 2: COORDINATED ROLLBACK ENGINE & SIGNAL TRAPPING
# -----------------------------------------------------------------------------
declare -a MODIFIED_DEPLOYMENTS=()
ROLLBACK_IN_PROGRESS=false
BASELINE_BACKEND=""
BASELINE_FRONTEND=""
BASELINE_WORKER=""

execute_rollback() {
  local failed_service="$1"
  local failure_reason="$2"

  if [ "${ROLLBACK_IN_PROGRESS}" = true ]; then
    return
  fi
  ROLLBACK_IN_PROGRESS=true

  # Disable signal traps during active rollback to prevent re-entrant loops
  trap '' SIGHUP SIGINT SIGTERM

  # Locally disable set -e inside rollback function so one failure does not crash the loop before restoring remaining services
  set +e

  echo ""
  log_error "=========================================================="
  log_error "ROLLBACK TRIGGERED at service: '${failed_service}'"
  log_error "Reason: ${failure_reason}"
  log_error "Restoring exact baseline images in reverse deployment order..."
  log_error "=========================================================="

  declare -a RESTORED_VERIFIED=()
  declare -a RESTORED_FAILED=()

  # Traverse modified deployments in exact reverse order
  for (( idx=${#MODIFIED_DEPLOYMENTS[@]}-1; idx>=0; idx-- )); do
    local svc="${MODIFIED_DEPLOYMENTS[idx]}"
    local expected_baseline=""
    local svc_failed=false

    case "${svc}" in
      backend)  expected_baseline="${BASELINE_BACKEND}" ;;
      frontend) expected_baseline="${BASELINE_FRONTEND}" ;;
      worker)   expected_baseline="${BASELINE_WORKER}" ;;
    esac

    log_warn "Restoring ${svc} to baseline: ${expected_baseline}..."

    # 1. Issue restore command (guarded)
    if ! kubectl set image deployment/"${svc}" "${svc}"="${expected_baseline}" -n "${TARGET_NAMESPACE}"; then
      log_error "Failed to issue rollback command for ${svc}!"
      svc_failed=true
    fi

    # 2. Await rollout completion (guarded)
    log_info "Awaiting ${svc} rollback rollout..."
    if ! kubectl rollout status deployment/"${svc}" -n "${TARGET_NAMESPACE}" --timeout="${TIMEOUT}"; then
      log_error "Rollback rollout timed out for ${svc}!"
      svc_failed=true
    fi

    # 3. Verify Deployment container image exact match (guarded)
    local current_deploy_image
    current_deploy_image=$(kubectl get deployment "${svc}" -n "${TARGET_NAMESPACE}" -o json 2>/dev/null | jq -r --arg c "${svc}" '.spec.template.spec.containers[] | select(.name==$c) | .image' 2>/dev/null || echo "")
    if [ "${current_deploy_image}" != "${expected_baseline}" ]; then
      log_error "Deployment image verification failed for ${svc}! Expected: ${expected_baseline}, Found: ${current_deploy_image}"
      svc_failed=true
    fi

    # 4. Verify Deployment readyReplicas == 1 (guarded)
    local ready_reps
    ready_reps=$(kubectl get deployment "${svc}" -n "${TARGET_NAMESPACE}" -o json 2>/dev/null | jq -r '.status.readyReplicas // 0' 2>/dev/null || echo "0")
    if [ "${ready_reps}" -ne 1 ]; then
      log_error "Deployment readyReplicas verification failed for ${svc}! Expected 1, Found: ${ready_reps}"
      svc_failed=true
    fi

    # 5. Verify exactly one active Pod, Running phase, container ready, and Pod image matches baseline (guarded narrow allowlist)
    local active_pods_json
    active_pods_json=$(kubectl get pods -l "app.kubernetes.io/name=${svc}" -n "${TARGET_NAMESPACE}" -o json 2>/dev/null || echo "{}")
    local pod_check_result
    pod_check_result=$(echo "${active_pods_json}" | jq -r --arg c "${svc}" --arg exp "${expected_baseline}" '
      def is_accepted_pod_image($actual; $expected):
        ($actual == $expected) or
        ($expected | startswith("srujans22/") and $actual == ("docker.io/" + $expected)) or
        (($expected | contains("/") | not) and $actual == ("docker.io/library/" + $expected));

      [.items[]? | select(.metadata.deletionTimestamp == null)] as $active
      | if ($active | length) != 1 then
          "active_pod_count_error:" + ($active | length | tostring)
        else
          $active[0] as $pod
          | ($pod.status.containerStatuses[]? | select(.name == $c)) as $cs
          | if ($pod.status.phase != "Running") then
              "phase_error:" + $pod.status.phase
            elif ($cs.ready != true) then
              "ready_error:" + ($cs.ready | tostring)
            elif (is_accepted_pod_image($cs.image; $exp) | not) then
              "image_mismatch:" + $cs.image + "!=expected:" + $exp
            else
              "ok"
            end
        end
    ' 2>/dev/null || echo "jq_evaluation_error")

    if [ "${pod_check_result}" != "ok" ]; then
      log_error "Pod rollback verification failed for ${svc}! Detail: ${pod_check_result}"
      svc_failed=true
    fi

    if [ "${svc_failed}" = true ]; then
      RESTORED_FAILED+=("${svc}")
    else
      RESTORED_VERIFIED+=("${svc}")
      log_success "Verified ${svc} restored to baseline (${expected_baseline}) with exactly 1 active pod Running and Ready."
    fi
  done

  # 6. Verify MongoDB and PVC state post-rollback (guarded)
  log_info "Verifying protected infrastructure state post-rollback..."
  local mongo_ok=false
  local pvc_ok=false

  local mongo_check
  mongo_check=$(kubectl get statefulset mongodb -n "${TARGET_NAMESPACE}" -o json 2>/dev/null | jq -r '
    if (.spec.replicas == 1) and (.status.readyReplicas == 1) and (.spec.template.spec.containers[] | select(.name=="mongodb") | .image == "mongo:7") then
      "ok"
    else
      "degraded"
    end
  ' 2>/dev/null || echo "check_failed")
  if [ "${mongo_check}" = "ok" ]; then
    mongo_ok=true
  else
    log_error "Post-rollback MongoDB StatefulSet check failed: ${mongo_check}"
  fi

  local pvc_check
  pvc_check=$(kubectl get pvc mongodb-pvc -n "${TARGET_NAMESPACE}" -o json 2>/dev/null | jq -r '
    if (.status.phase == "Bound") and (.status.capacity.storage == "2Gi") then
      "ok"
    else
      "degraded"
    end
  ' 2>/dev/null || echo "check_failed")
  if [ "${pvc_check}" = "ok" ]; then
    pvc_ok=true
  else
    log_error "Post-rollback MongoDB PVC check failed: ${pvc_check}"
  fi

  # Final rollback report
  echo ""
  echo "=========================================================="
  echo "ROLLBACK OUTCOME REPORT:"
  echo "=========================================================="
  if [ ${#RESTORED_VERIFIED[@]} -gt 0 ]; then
    echo "Fully Restored and Verified:"
    for s in "${RESTORED_VERIFIED[@]}"; do
      echo "  ✓ ${s}"
    done
  fi
  if [ ${#RESTORED_FAILED[@]} -gt 0 ]; then
    echo "Restoration Attempted But Failed (MANUAL INTERVENTION REQUIRED):"
    for s in "${RESTORED_FAILED[@]}"; do
      echo "  ✗ ${s}"
    done
  fi
  echo ""
  echo "Protected Infrastructure Verification:"
  if [ "${mongo_ok}" = true ]; then
    echo "  ✓ MongoDB StatefulSet (1/1 Ready, image: mongo:7)"
  else
    echo "  ✗ MongoDB StatefulSet verification failed!"
  fi
  if [ "${pvc_ok}" = true ]; then
    echo "  ✓ MongoDB PVC (Bound, capacity: 2Gi)"
  else
    echo "  ✗ MongoDB PVC verification failed!"
  fi
  echo "=========================================================="

  if [ ${#RESTORED_FAILED[@]} -gt 0 ] || [ "${mongo_ok}" != true ] || [ "${pvc_ok}" != true ]; then
    log_error "ROLLBACK COMPLETED WITH ERRORS. Manual intervention required!"
    exit 1
  else
    log_warn "Rollback completed and fully verified. All modified Deployments restored to baseline images."
    log_error "Deployment failed. Exiting non-zero."
    exit 1
  fi
}

handle_signal() {
  local sig="$1"
  echo ""
  log_warn "Received signal ${sig}!"
  if [ "${ROLLBACK_IN_PROGRESS}" = true ]; then
    log_warn "Rollback already active. Ignoring signal ${sig} to prevent recursive execution."
    return
  fi
  if [ "${#MODIFIED_DEPLOYMENTS[@]}" -gt 0 ]; then
    log_error "Signal ${sig} received while deployment mutations in progress. Triggering rollback..."
    execute_rollback "signal_${sig}" "Process interrupted by signal ${sig}"
  else
    log_info "Zero deployments modified prior to signal ${sig}. Exiting non-zero."
    exit 1
  fi
}

# Install guarded signal handlers immediately
trap 'handle_signal SIGHUP' SIGHUP
trap 'handle_signal SIGINT' SIGINT
trap 'handle_signal SIGTERM' SIGTERM

# -----------------------------------------------------------------------------
# STEP 3: PRE-FLIGHT VERIFICATION & CONTEXT ENFORCEMENT
# -----------------------------------------------------------------------------
log_info "Executing pre-flight checks..."

for tool in kubectl jq; do
  if ! command -v "${tool}" >/dev/null 2>&1; then
    log_error "Required tool '${tool}' is not installed or not in PATH."
    exit 1
  fi
done

# 1. Enforce exact Minikube context
CURRENT_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "")
if [ "${CURRENT_CONTEXT}" != "${REQUIRED_CONTEXT}" ]; then
  log_error "Context violation: current kubectl context is '${CURRENT_CONTEXT}'. Must equal exactly '${REQUIRED_CONTEXT}'."
  log_error "Deployments to non-minikube clusters are strictly prohibited by safety policy."
  exit 1
fi

# 2. Enforce Minikube profile running
if ! minikube status -p minikube --format='{{.Host}}' 2>/dev/null | grep -qi "running"; then
  log_error "Minikube profile 'minikube' is not running."
  exit 1
fi

# 3. Enforce API server reachable
if ! kubectl cluster-info --request-timeout=5s >/dev/null 2>&1; then
  log_error "Kubernetes API server is unreachable via kubectl."
  exit 1
fi

# 4. Enforce namespace exists
if ! kubectl get namespace "${TARGET_NAMESPACE}" >/dev/null 2>&1; then
  log_error "Target namespace '${TARGET_NAMESPACE}' does not exist in cluster."
  exit 1
fi

# 5. Enforce Deployment existence and container singularity
for dep in backend frontend worker; do
  if ! kubectl get deployment "${dep}" -n "${TARGET_NAMESPACE}" >/dev/null 2>&1; then
    log_error "Required Deployment 'deployment/${dep}' does not exist in namespace '${TARGET_NAMESPACE}'."
    exit 1
  fi
  CONTAINER_COUNT=$(kubectl get deployment "${dep}" -n "${TARGET_NAMESPACE}" -o json | jq '.spec.template.spec.containers | length')
  if [ "${CONTAINER_COUNT}" -ne 1 ]; then
    log_error "Deployment '${dep}' container count violation: expected exactly 1 container, found ${CONTAINER_COUNT}."
    exit 1
  fi
  CONTAINER_NAME=$(kubectl get deployment "${dep}" -n "${TARGET_NAMESPACE}" -o json | jq -r --arg d "${dep}" '.spec.template.spec.containers[] | select(.name==$d) | .name')
  if [ "${CONTAINER_NAME}" != "${dep}" ]; then
    log_error "Deployment '${dep}' container name mismatch: expected container '${dep}', found '${CONTAINER_NAME}'."
    exit 1
  fi
done

# 6. Worker Singleton Invariant Verification
WORKER_PRE_REPLICAS=$(kubectl get deployment worker -n "${TARGET_NAMESPACE}" -o json | jq -r '.spec.replicas')
WORKER_PRE_STRATEGY=$(kubectl get deployment worker -n "${TARGET_NAMESPACE}" -o json | jq -r '.spec.strategy.type')

if [ "${WORKER_PRE_REPLICAS}" -ne 1 ]; then
  log_error "Worker replicas constraint violated: expected 1, found ${WORKER_PRE_REPLICAS}."
  exit 1
fi

if [ "${WORKER_PRE_STRATEGY}" != "Recreate" ]; then
  log_error "Worker strategy constraint violated: expected 'Recreate', found '${WORKER_PRE_STRATEGY}'."
  exit 1
fi
log_success "Worker singleton verified: replicas=1, strategy=Recreate."

# 7. MongoDB Database & PVC Read-Only Safety Audit
log_info "Verifying MongoDB database health (read-only audit)..."
MONGO_JSON=$(kubectl get statefulset mongodb -n "${TARGET_NAMESPACE}" -o json 2>/dev/null || echo "{}")
MONGO_DESIRED=$(echo "${MONGO_JSON}" | jq -r '.spec.replicas // 0')
MONGO_READY=$(echo "${MONGO_JSON}" | jq -r '.status.readyReplicas // 0')
MONGO_IMG=$(echo "${MONGO_JSON}" | jq -r '.spec.template.spec.containers[] | select(.name=="mongodb") | .image // ""')

if [ "${MONGO_DESIRED}" -ne 1 ] || [ "${MONGO_READY}" -ne 1 ] || [ "${MONGO_IMG}" != "mongo:7" ]; then
  log_error "MongoDB StatefulSet invariant check failed! (Desired: ${MONGO_DESIRED}, Ready: ${MONGO_READY}, Image: ${MONGO_IMG}; expected 1/1 Ready, image mongo:7)."
  log_error "Deployment halted to protect database integrity."
  exit 1
fi

PVC_JSON=$(kubectl get pvc mongodb-pvc -n "${TARGET_NAMESPACE}" -o json 2>/dev/null || echo "{}")
PVC_PHASE=$(echo "${PVC_JSON}" | jq -r '.status.phase // "NotFound"')
PVC_CAP=$(echo "${PVC_JSON}" | jq -r '.status.capacity.storage // "Unknown"')

if [ "${PVC_PHASE}" != "Bound" ] || [ "${PVC_CAP}" != "2Gi" ]; then
  log_error "MongoDB PVC invariant check failed! (Phase: ${PVC_PHASE}, Capacity: ${PVC_CAP}; expected Bound, 2Gi)."
  exit 1
fi
log_success "MongoDB StatefulSet and PVC verified healthy. (Zero modifications will be made to MongoDB)."

# -----------------------------------------------------------------------------
# STEP 3: CAPTURE BASELINE IMAGES & FAIL-CLOSED WORKER HEARTBEAT
# -----------------------------------------------------------------------------
BASELINE_BACKEND=$(kubectl get deployment backend -n "${TARGET_NAMESPACE}" -o json | jq -r '.spec.template.spec.containers[] | select(.name=="backend") | .image')
BASELINE_FRONTEND=$(kubectl get deployment frontend -n "${TARGET_NAMESPACE}" -o json | jq -r '.spec.template.spec.containers[] | select(.name=="frontend") | .image')
BASELINE_WORKER=$(kubectl get deployment worker -n "${TARGET_NAMESPACE}" -o json | jq -r '.spec.template.spec.containers[] | select(.name=="worker") | .image')

if [ -z "${BASELINE_BACKEND}" ] || [ -z "${BASELINE_FRONTEND}" ] || [ -z "${BASELINE_WORKER}" ]; then
  log_error "Failed to capture baseline image references for one or more deployments."
  exit 1
fi

log_info "Captured Exact Baseline Images:"
echo "  - backend : ${BASELINE_BACKEND}"
echo "  - frontend: ${BASELINE_FRONTEND}"
echo "  - worker  : ${BASELINE_WORKER}"

# Fail-Closed Pre-Rollout Worker Heartbeat Audit
log_info "Auditing pre-rollout worker heartbeat baseline (fail-closed)..."
if ! PRE_HEARTBEAT_DATA=$(kubectl exec -n "${TARGET_NAMESPACE}" deployment/worker -c worker -- node -e '
  const fs = require("fs");
  const p = "/tmp/worker-heartbeat";
  if (!fs.existsSync(p)) {
    console.error("Worker heartbeat file does not exist at " + p);
    process.exit(1);
  }
  const age = Date.now() - fs.statSync(p).mtimeMs;
  if (age > 45000) {
    console.error("Worker heartbeat file is stale: " + Math.round(age/1000) + "s old (threshold: 45s)");
    process.exit(1);
  }
  try {
    const d = JSON.parse(fs.readFileSync(p, "utf8"));
    if (typeof d.timestamp === "number" && Number.isFinite(d.timestamp) && d.timestamp > 0 && d.status === "healthy" && d.db === "connected") {
      console.log(JSON.stringify({ timestamp: d.timestamp, ageMs: age }));
      process.exit(0);
    }
    console.error("Worker heartbeat content invalid: " + JSON.stringify(d));
    process.exit(1);
  } catch (err) {
    console.error("Failed to parse worker heartbeat JSON: " + err.message);
    process.exit(1);
  }
' 2>&1); then
  log_error "Pre-rollout worker heartbeat baseline check failed!"
  log_error "${PRE_HEARTBEAT_DATA}"
  log_error "Deployment halted to prevent deploying against an unhealthy worker baseline."
  exit 1
fi

# Strict finite positive numeric validation via jq (no shell arithmetic assumptions)
PRE_ROLLOUT_TIMESTAMP=$(echo "${PRE_HEARTBEAT_DATA}" | jq -e '
  if (.timestamp | type == "number" and isfinite and . > 0) then
    .timestamp
  else
    error("Invalid non-numeric or non-positive timestamp")
  end
' 2>/dev/null) || {
  log_error "Pre-rollout worker heartbeat timestamp validation failed. Found: '${PRE_HEARTBEAT_DATA}'."
  exit 1
}

log_success "Verified valid positive pre-rollout worker heartbeat timestamp: ${PRE_ROLLOUT_TIMESTAMP}"

# Dry run exit point
if [ "${DRY_RUN}" = true ]; then
  log_info "Dry run enabled. Validating kubectl set image commands client-side..."
  kubectl set image deployment/backend backend="${BACKEND_TARGET_IMAGE}" -n "${TARGET_NAMESPACE}" --dry-run=client >/dev/null
  kubectl set image deployment/frontend frontend="${FRONTEND_TARGET_IMAGE}" -n "${TARGET_NAMESPACE}" --dry-run=client >/dev/null
  kubectl set image deployment/worker worker="${WORKER_TARGET_IMAGE}" -n "${TARGET_NAMESPACE}" --dry-run=client >/dev/null
  log_success "Dry run validation completed. All pre-flight checks passed; zero mutations applied."
  exit 0
fi

# -----------------------------------------------------------------------------
# STEP 5: SEQUENTIAL APPLICATION DEPLOYMENT
# -----------------------------------------------------------------------------

# Phase A: Backend Deployment
log_info "----------------------------------------------------------"
log_info "Phase A: Updating Backend Image -> ${BACKEND_TARGET_IMAGE}"
log_info "----------------------------------------------------------"
# Track before mutation command to protect against ambiguous network disconnects
MODIFIED_DEPLOYMENTS+=("backend")
if ! kubectl set image deployment/backend backend="${BACKEND_TARGET_IMAGE}" -n "${TARGET_NAMESPACE}"; then
  execute_rollback "backend" "kubectl set image command failed"
fi

log_info "Awaiting backend rollout completion (timeout: ${TIMEOUT})..."
if ! kubectl rollout status deployment/backend -n "${TARGET_NAMESPACE}" --timeout="${TIMEOUT}"; then
  execute_rollback "backend" "Rollout timed out or pods failed to start"
fi

log_info "Verifying backend health endpoint (/api/v1/health)..."
if ! kubectl exec -n "${TARGET_NAMESPACE}" deployment/backend -c backend -- node -e '
  fetch("http://localhost:5001/api/v1/health")
    .then(r => { if (r.status !== 200) process.exit(1); return r.json(); })
    .then(d => {
      if (d.status === "ok" && d.database === "connected" && d.service === "queueless-backend") process.exit(0);
      process.exit(1);
    })
    .catch(() => process.exit(1));
'; then
  execute_rollback "backend" "Health check failed (HTTP non-200 or database disconnected)"
fi
log_success "Backend deployment verified and healthy."

# Phase B: Frontend Deployment
log_info "----------------------------------------------------------"
log_info "Phase B: Updating Frontend Image -> ${FRONTEND_TARGET_IMAGE}"
log_info "----------------------------------------------------------"
MODIFIED_DEPLOYMENTS+=("frontend")
if ! kubectl set image deployment/frontend frontend="${FRONTEND_TARGET_IMAGE}" -n "${TARGET_NAMESPACE}"; then
  execute_rollback "frontend" "kubectl set image command failed"
fi

log_info "Awaiting frontend rollout completion (timeout: ${TIMEOUT})..."
if ! kubectl rollout status deployment/frontend -n "${TARGET_NAMESPACE}" --timeout="${TIMEOUT}"; then
  execute_rollback "frontend" "Rollout timed out or pods failed to start"
fi

log_info "Verifying frontend health endpoint (/api/health)..."
if ! kubectl exec -n "${TARGET_NAMESPACE}" deployment/frontend -c frontend -- node -e '
  fetch("http://localhost:3000/api/health")
    .then(r => { if (r.status !== 200) process.exit(1); return r.json(); })
    .then(d => {
      if (d.status === "ok" && d.service === "queueless-frontend") process.exit(0);
      process.exit(1);
    })
    .catch(() => process.exit(1));
'; then
  execute_rollback "frontend" "Health check failed (HTTP non-200 or invalid status)"
fi
log_success "Frontend deployment verified and healthy."

# Phase C: Worker Deployment
log_info "----------------------------------------------------------"
log_info "Phase C: Updating Worker Image -> ${WORKER_TARGET_IMAGE}"
log_info "----------------------------------------------------------"
MODIFIED_DEPLOYMENTS+=("worker")
if ! kubectl set image deployment/worker worker="${WORKER_TARGET_IMAGE}" -n "${TARGET_NAMESPACE}"; then
  execute_rollback "worker" "kubectl set image command failed"
fi

log_info "Awaiting worker rollout completion (timeout: ${TIMEOUT})..."
if ! kubectl rollout status deployment/worker -n "${TARGET_NAMESPACE}" --timeout="${TIMEOUT}"; then
  execute_rollback "worker" "Rollout timed out or pods failed to start"
fi

# Re-verify Worker Singleton constraints post-rollout
WORKER_POST_REPLICAS=$(kubectl get deployment worker -n "${TARGET_NAMESPACE}" -o json | jq -r '.spec.replicas')
WORKER_POST_STRATEGY=$(kubectl get deployment worker -n "${TARGET_NAMESPACE}" -o json | jq -r '.spec.strategy.type')

if [ "${WORKER_POST_REPLICAS}" -ne 1 ] || [ "${WORKER_POST_STRATEGY}" != "Recreate" ]; then
  execute_rollback "worker" "Worker singleton invariant violated post-rollout (replicas=${WORKER_POST_REPLICAS}, strategy=${WORKER_POST_STRATEGY})"
fi

# Bounded Worker Heartbeat Polling Loop (60s timeout, 3s interval)
log_info "Polling for fresh worker heartbeat (newer than ${PRE_ROLLOUT_TIMESTAMP})..."
POLL_TIMEOUT="${WORKER_HEARTBEAT_TIMEOUT:-60}"
POLL_INTERVAL="${WORKER_HEARTBEAT_INTERVAL:-3}"
ELAPSED=0
HEARTBEAT_VERIFIED=false

while [ "${ELAPSED}" -lt "${POLL_TIMEOUT}" ]; do
  HEARTBEAT_DATA=$(kubectl exec -n "${TARGET_NAMESPACE}" deployment/worker -c worker -- node -e '
    const fs = require("fs");
    const p = "/tmp/worker-heartbeat";
    if (!fs.existsSync(p)) process.exit(1);
    const age = Date.now() - fs.statSync(p).mtimeMs;
    if (age > 45000) process.exit(1);
    try {
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      if (typeof d.timestamp === "number" && Number.isFinite(d.timestamp) && d.timestamp > 0 && d.status === "healthy" && d.db === "connected") {
        console.log(JSON.stringify({ timestamp: d.timestamp, ageMs: age }));
        process.exit(0);
      }
      process.exit(1);
    } catch { process.exit(1); }
  ' 2>/dev/null) || true

  if [ -n "${HEARTBEAT_DATA}" ]; then
    # Safe comparison using jq: requires finite positive number strictly greater than baseline
    IS_NEWER=$(echo "${HEARTBEAT_DATA}" | jq -e -n --argjson pre "${PRE_ROLLOUT_TIMESTAMP}" --argjson cur "$(echo "${HEARTBEAT_DATA}" | jq .timestamp)" '
      ($pre | type == "number" and isfinite and . > 0) and
      ($cur | type == "number" and isfinite and . > 0) and
      ($cur > $pre)
    ' 2>/dev/null || echo "false")

    if [ "${IS_NEWER}" = "true" ]; then
      CURRENT_TIMESTAMP=$(echo "${HEARTBEAT_DATA}" | jq .timestamp)
      log_success "Verified fresh worker heartbeat: timestamp ${CURRENT_TIMESTAMP} > pre-rollout ${PRE_ROLLOUT_TIMESTAMP}."
      HEARTBEAT_VERIFIED=true
      break
    fi
  fi

  log_info "Heartbeat not yet refreshed past baseline. Retrying in ${POLL_INTERVAL}s... (${ELAPSED}/${POLL_TIMEOUT}s)"
  sleep "${POLL_INTERVAL}"
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

if [ "${HEARTBEAT_VERIFIED}" != true ]; then
  execute_rollback "worker" "Worker heartbeat timed out after ${POLL_TIMEOUT}s (no fresh heartbeat newer than pre-rollout timestamp)"
fi
log_success "Worker deployment verified and healthy."

# -----------------------------------------------------------------------------
# STEP 6: POST-DEPLOYMENT FINAL AUDIT GATE
# -----------------------------------------------------------------------------
log_info "Executing final post-deployment cluster audit..."
FINAL_AUDIT_FAILURE_REASON=""

# 1. Audit application Deployments and Pods
for svc in backend frontend worker; do
  EXPECTED_TARGET=""
  case "${svc}" in
    backend)  EXPECTED_TARGET="${BACKEND_TARGET_IMAGE}" ;;
    frontend) EXPECTED_TARGET="${FRONTEND_TARGET_IMAGE}" ;;
    worker)   EXPECTED_TARGET="${WORKER_TARGET_IMAGE}" ;;
  esac

  # 1a. Deployment spec image exact string match
  DEPLOY_JSON=$(kubectl get deployment "${svc}" -n "${TARGET_NAMESPACE}" -o json 2>/dev/null || echo "{}")
  DEPLOY_IMG=$(echo "${DEPLOY_JSON}" | jq -r --arg c "${svc}" '.spec.template.spec.containers[] | select(.name==$c) | .image // ""')
  if [ "${DEPLOY_IMG}" != "${EXPECTED_TARGET}" ]; then
    FINAL_AUDIT_FAILURE_REASON="Deployment '${svc}' spec image mismatch: expected '${EXPECTED_TARGET}', found '${DEPLOY_IMG}'"
    break
  fi

  # 1b. Deployment replicas (ready, updated, and available must equal exactly 1)
  READY_REPS=$(echo "${DEPLOY_JSON}" | jq -r '.status.readyReplicas // 0')
  UP_TO_DATE_REPS=$(echo "${DEPLOY_JSON}" | jq -r '.status.updatedReplicas // 0')
  AVAIL_REPS=$(echo "${DEPLOY_JSON}" | jq -r '.status.availableReplicas // 0')
  if [ "${READY_REPS}" -ne 1 ] || [ "${UP_TO_DATE_REPS}" -ne 1 ] || [ "${AVAIL_REPS}" -ne 1 ]; then
    FINAL_AUDIT_FAILURE_REASON="Deployment '${svc}' replica count mismatch (ready: ${READY_REPS}, updated: ${UP_TO_DATE_REPS}, available: ${AVAIL_REPS}; expected 1)"
    break
  fi

  # 1c, 1d, 1e, 1f. Exactly one active Pod, Running phase, container ready, container image matches target (narrow allowlist)
  ACTIVE_PODS_JSON=$(kubectl get pods -l "app.kubernetes.io/name=${svc}" -n "${TARGET_NAMESPACE}" -o json 2>/dev/null || echo "{}")
  POD_AUDIT_STATUS=$(echo "${ACTIVE_PODS_JSON}" | jq -r --arg c "${svc}" --arg tgt "${EXPECTED_TARGET}" '
    def is_accepted_pod_image($actual; $expected):
      ($actual == $expected) or
      ($expected | startswith("srujans22/") and $actual == ("docker.io/" + $expected)) or
      (($expected | contains("/") | not) and $actual == ("docker.io/library/" + $expected));

    [.items[]? | select(.metadata.deletionTimestamp == null)] as $active
    | if ($active | length) != 1 then
        "active_pod_count_error: found " + ($active | length | tostring) + " active pods, expected exactly 1"
      else
        $active[0] as $pod
        | ($pod.status.containerStatuses[]? | select(.name == $c)) as $cs
        | if ($pod.status.phase != "Running") then
            "pod_phase_error: pod phase is " + $pod.status.phase + " (expected Running)"
          elif ($cs.ready != true) then
            "pod_not_ready: container " + $c + " ready status is false"
          elif (is_accepted_pod_image($cs.image; $tgt) | not) then
            "image_mismatch: status image " + $cs.image + " does not match target " + $tgt
          else
            "ok"
          end
      end
  ' 2>/dev/null || echo "jq_evaluation_error")

  if [ "${POD_AUDIT_STATUS}" != "ok" ]; then
    FINAL_AUDIT_FAILURE_REASON="Pod audit check failed for '${svc}': ${POD_AUDIT_STATUS}"
    break
  fi
done

# If application audit failed, immediately trigger coordinated rollback
if [ -n "${FINAL_AUDIT_FAILURE_REASON}" ]; then
  log_error "Final post-deployment audit failed: ${FINAL_AUDIT_FAILURE_REASON}"
  execute_rollback "final_audit" "${FINAL_AUDIT_FAILURE_REASON}"
fi

# 2. Audit MongoDB StatefulSet (read-only verification)
MONGO_AUDIT=$(kubectl get statefulset mongodb -n "${TARGET_NAMESPACE}" -o json 2>/dev/null | jq -r '
  if (.spec.replicas == 1) and (.status.readyReplicas == 1) and (.spec.template.spec.containers[] | select(.name=="mongodb") | .image == "mongo:7") then
    "ok"
  else
    "failed"
  end
' 2>/dev/null || echo "error")

if [ "${MONGO_AUDIT}" != "ok" ]; then
  FINAL_AUDIT_FAILURE_REASON="Final audit check failed for MongoDB StatefulSet (replicas != 1, readyReplicas != 1, or image != mongo:7)"
  execute_rollback "final_audit" "${FINAL_AUDIT_FAILURE_REASON}"
fi

# 3. Audit MongoDB PVC (read-only verification)
PVC_AUDIT=$(kubectl get pvc mongodb-pvc -n "${TARGET_NAMESPACE}" -o json 2>/dev/null | jq -r '
  if (.status.phase == "Bound") and (.status.capacity.storage == "2Gi") then
    "ok"
  else
    "failed"
  end
' 2>/dev/null || echo "error")

if [ "${PVC_AUDIT}" != "ok" ]; then
  FINAL_AUDIT_FAILURE_REASON="Final audit check failed for MongoDB PVC (phase != Bound or capacity != 2Gi)"
  execute_rollback "final_audit" "${FINAL_AUDIT_FAILURE_REASON}"
fi

echo ""
echo "=========================================================="
log_success "DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "=========================================================="
echo "Deployed Commit SHA : ${CLEAN_SHA}"
echo "Deployment Tag      : ${FULL_SHA_TAG}"
echo "Target Namespace    : ${TARGET_NAMESPACE}"
echo ""
echo "Application Deployment Status Table:"
for svc in backend frontend worker; do
  DEPLOY_JSON=$(kubectl get deployment "${svc}" -n "${TARGET_NAMESPACE}" -o json)
  IMG=$(echo "${DEPLOY_JSON}" | jq -r --arg c "${svc}" '.spec.template.spec.containers[] | select(.name==$c) | .image')
  READY=$(echo "${DEPLOY_JSON}" | jq -r '.status.readyReplicas // 0')
  UP_TO_DATE=$(echo "${DEPLOY_JSON}" | jq -r '.status.updatedReplicas // 0')
  AVAILABLE=$(echo "${DEPLOY_JSON}" | jq -r '.status.availableReplicas // 0')
  printf "  %-10s READY:%-2s UP-TO-DATE:%-2s AVAILABLE:%-2s IMAGE:%s\n" "${svc}" "${READY}" "${UP_TO_DATE}" "${AVAILABLE}" "${IMG}"
done
echo ""
log_info "Protected Infrastructure Status (Verified Untouched):"
MONGO_JSON=$(kubectl get statefulset mongodb -n "${TARGET_NAMESPACE}" -o json)
MONGO_IMG=$(echo "${MONGO_JSON}" | jq -r '.spec.template.spec.containers[] | select(.name=="mongodb") | .image')
MONGO_READY=$(echo "${MONGO_JSON}" | jq -r '.status.readyReplicas // 0')
printf "  %-10s READY:%-2s IMAGE:%s\n" "mongodb" "${MONGO_READY}" "${MONGO_IMG}"

PVC_JSON=$(kubectl get pvc mongodb-pvc -n "${TARGET_NAMESPACE}" -o json)
PVC_STATUS=$(echo "${PVC_JSON}" | jq -r '.status.phase // "NotFound"')
PVC_CAP=$(echo "${PVC_JSON}" | jq -r '.status.capacity.storage // "Unknown"')
printf "  %-10s STATUS:%-6s CAPACITY:%s\n" "mongodb-pvc" "${PVC_STATUS}" "${PVC_CAP}"
echo "=========================================================="
