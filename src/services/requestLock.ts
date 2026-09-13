import { computed, ref } from 'vue'

const pendingMutations = ref(0)

export const requestLockState = {
  pendingMutations,
  locked: computed(() => pendingMutations.value > 0),
}

export function beginMutationLock() {
  pendingMutations.value += 1
}

export function endMutationLock() {
  pendingMutations.value = Math.max(0, pendingMutations.value - 1)
}
