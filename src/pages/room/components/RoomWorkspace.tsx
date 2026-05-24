import { RoomWorkspaceContentBlock } from "./RoomWorkspaceContentBlock";
import { RoomWorkspaceStatusBlock } from "./RoomWorkspaceStatusBlock";
import type { RoomWorkspaceBannerAction, RoomWorkspaceProps } from "./RoomWorkspace.types";

export function RoomWorkspace(props: RoomWorkspaceProps) {
  const { access, uiScenario: scenario, visibility } = props;

  function renderBannerAction(kind: RoomWorkspaceBannerAction) {
    if (!kind) {
      return null;
    }

    const className =
      kind.tone === "apply"
        ? "room-guest-status-badge room-guest-status-badge-apply room-applications-warning-action"
        : kind.tone === "judge"
          ? "room-guest-status-badge room-guest-status-badge-judge room-applications-warning-action"
          : kind.tone === "edit"
            ? "room-guest-status-badge room-guest-status-badge-waiting room-applications-warning-action"
            : "room-guest-status-badge room-guest-status-badge-delete room-applications-warning-action";
    const isJudgeAction = kind.kind.startsWith("judge");
    const loading = isJudgeAction ? props.guestJudgeApplicationState === "loading" : props.guestApplicationState === "loading";

    const onClick =
      kind.kind === "trainer-apply"
        ? props.onGuestApply
        : kind.kind === "trainer-edit"
          ? props.onGuestEdit
          : kind.kind === "trainer-delete"
            ? props.onGuestDelete
            : kind.kind === "judge-apply"
              ? props.onJudgeCreate
              : props.onJudgeDeleteRequest;

    return (
      <button type="button" className={className} disabled={loading} onClick={onClick}>
        {loading ? kind.loadingText : kind.label}
      </button>
    );
  }

  return (
    <div className="room-workspace">
      <RoomWorkspaceStatusBlock
        access={access}
        activeRingName={props.activeRingName}
        renderBannerAction={renderBannerAction}
        scenario={scenario}
        visibleRingTabs={props.visibleRingTabs}
        waitingApplicationsCount={props.waitingApplicationsCount}
        ownerTab={props.ownerTab}
        onOpenRing={props.onOpenRing}
        onTabChange={props.onTabChange}
      />

      <RoomWorkspaceContentBlock
        access={access}
        activeBoxers={props.activeBoxers}
        activeFight={props.activeFight}
        activeJudges={props.activeJudges}
        activeRing={props.activeRing}
        activeRingGrids={props.activeRingGrids}
        activeRings={props.activeRings}
        applicationsState={props.applicationsState}
        boxersState={props.boxersState}
        canSaveOrder={props.canSaveOrder}
        deleteState={props.deleteState}
        deletingBoxerId={props.deletingBoxerId}
        filteredFightRows={props.filteredFightRows}
        filteredGrids={props.filteredGrids}
        fightRows={props.fightRows}
        getJudgeName={props.getJudgeName}
        gridSearch={props.gridSearch}
        gridState={props.gridState}
        gridsState={props.gridsState}
        hasDraftOrder={props.hasDraftOrder}
        inactiveBoxers={props.inactiveBoxers}
        inactiveJudges={props.inactiveJudges}
        judgeApplicationsState={props.judgeApplicationsState}
        isTimerRunning={props.isTimerRunning}
        isWinnerMenuOpen={props.isWinnerMenuOpen}
        nextRound={props.nextRound}
        onBoxerDelete={props.onBoxerDelete}
        onBoxerEdit={props.onBoxerEdit}
        onFightNotesOpen={props.onFightNotesOpen}
        onFightSelect={props.onFightSelect}
        onFightStatusChange={props.onFightStatusChange}
        onGridOpen={props.onGridOpen}
        onGridSearchChange={props.onGridSearchChange}
        onJudgeChange={props.onJudgeChange}
        onJudgeDelete={props.onJudgeDelete}
        onJudgeRingSelect={props.onJudgeRingSelect}
        onPendingApplicationAction={props.onPendingApplicationAction}
        onRingDetailSearchChange={props.onRingDetailSearchChange}
        onRoundSelect={props.onRoundSelect}
        onSaveOrder={props.onSaveOrder}
        onSearchChange={props.onBoxerSearchChange}
        onTimerDurationChange={props.onTimerDurationChange}
        onTimerStart={props.onTimerStart}
        onTimerStop={props.onTimerStop}
        onToggleBoxer={props.onToggleBoxer}
        onViewModeChange={props.onViewModeChange}
        onWinnerConfirm={props.onWinnerConfirm}
        onWinnerMenuToggle={props.onWinnerMenuToggle}
        onWinnerSelect={props.onWinnerSelect}
        renderGrid={props.renderGrid}
        renderGridSortButton={props.renderGridSortButton}
        renderRingGrid={props.renderRingGrid}
        ringDetailSearch={props.ringDetailSearch}
        ringDetailViewMode={props.ringDetailViewMode}
        ringSideJudgesState={props.ringSideJudgesState}
        roomApplications={props.roomApplications}
        roomJudgeApplications={props.roomJudgeApplications}
        roundTimerSeconds={props.roundTimerSeconds}
        roundTimerText={props.roundTimerText}
        scenario={scenario}
        search={props.search}
        selectedBoxerIds={props.selectedBoxerIds}
        selectedFightRow={props.selectedFightRow}
        selectedFightWinner={props.selectedFightWinner}
        selectedFightWinnerBlueUuid={props.selectedFightWinnerBlueUuid}
        selectedFightWinnerRedUuid={props.selectedFightWinnerRedUuid}
        submittedRounds={props.submittedRounds}
        timerOptions={props.timerOptions}
        updateState={props.updateState}
        updatingApplicationId={props.updatingApplicationId}
        updatingJudgeApplicationId={props.updatingJudgeApplicationId}
        visibility={visibility}
        visiblePairsGrids={props.visiblePairsGrids}
        winnerDropdownRef={props.winnerDropdownRef}
      />
    </div>
  );
}
