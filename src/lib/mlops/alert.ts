export type AlertCooldownState = {
  lastAlertTick: number | null;
  cooldownTicks: number;
};

export function createAlertCooldown(cooldownTicks: number): AlertCooldownState {
  if (cooldownTicks < 0)
    throw new Error("createAlertCooldown: cooldownTicks must be >= 0");
  return { lastAlertTick: null, cooldownTicks };
}

/** True when an alert is allowed at `tick` given prior alert timing. */
export function canFireAlert(state: AlertCooldownState, tick: number): boolean {
  if (state.lastAlertTick === null) return true;
  return tick - state.lastAlertTick >= state.cooldownTicks;
}

/**
 * Attempt to fire. Returns whether it fired and the next cooldown state.
 * Simulated notify only — never sends real Slack/email.
 */
export function tryFireAlert(
  state: AlertCooldownState,
  tick: number,
): { fired: boolean; state: AlertCooldownState; reason: string } {
  if (!canFireAlert(state, tick)) {
    return {
      fired: false,
      state,
      reason: "cooldown_active",
    };
  }
  return {
    fired: true,
    state: { ...state, lastAlertTick: tick },
    reason: "simulated_alert_recorded",
  };
}
