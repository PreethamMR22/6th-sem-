import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { snapPositionOnFloor } from '../constants/factoryFloor';

export const useStore = create((set, get) => ({
  machines: [],
  connections: [],
  selectedMachineId: null,
  selectedConnectionId: null,
  hoveredMachineId: null,
  draggingMachineId: null,
  connectionDraft: null,
  connectionDraftEnd: [0, 0.6, 0],
  connectionHoverTargetId: null,
  orbitBlocked: false,
  cameraFocus: null,
  isSidebarOpen: true,
  isDetailsOpen: false,

  setOrbitBlocked: (blocked) => set({ orbitBlocked: blocked }),

  setHoveredMachine: (id) => set({ hoveredMachineId: id }),

  setCameraFocus: (position) => set({ cameraFocus: position }),

  addMachine: (type, position = null) =>
    set((state) => {
      const raw =
        position || [(Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10];
      const [x, , z] = snapPositionOnFloor(raw[0], raw[2]);
      const finalPosition = [x, 0, z];
      const newMachine = {
        id: uuidv4(),
        type: type.id,
        name: `${type.name} #${state.machines.filter((m) => m.type === type.id).length + 1}`,
        position: finalPosition,
        status: 'RUNNING',
        telemetry: {
          rpm: Math.floor(Math.random() * 2000) + 1000,
          temp: Math.floor(Math.random() * 30) + 40,
          efficiency: 95,
          stitchCount: 0,
          queue: Math.floor(Math.random() * 5),
          throughput: 72 + Math.floor(Math.random() * 20),
        },
        logs: [{ time: new Date().toLocaleTimeString(), message: 'System initialized', type: 'INFO' }],
      };
      return {
        machines: [...state.machines, newMachine],
        selectedMachineId: newMachine.id,
        selectedConnectionId: null,
        isDetailsOpen: true,
        cameraFocus: [...finalPosition],
      };
    }),

  removeMachine: (id) =>
    set((state) => {
      const connections = state.connections.filter((c) => c.source !== id && c.target !== id);
      const removedConn =
        state.selectedConnectionId &&
        !connections.some((c) => c.id === state.selectedConnectionId);
      return {
        machines: state.machines.filter((m) => m.id !== id),
        connections,
        selectedMachineId: state.selectedMachineId === id ? null : state.selectedMachineId,
        selectedConnectionId: removedConn ? null : state.selectedConnectionId,
        isDetailsOpen:
          state.selectedMachineId === id || removedConn ? false : state.isDetailsOpen,
        draggingMachineId: state.draggingMachineId === id ? null : state.draggingMachineId,
        connectionDraft: state.connectionDraft?.sourceId === id ? null : state.connectionDraft,
        orbitBlocked: state.connectionDraft?.sourceId === id ? false : state.orbitBlocked,
      };
    }),

  updateMachinePosition: (id, position) =>
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, position } : m)),
    })),

  beginMachineDrag: (id) =>
    set({
      draggingMachineId: id,
      orbitBlocked: true,
      selectedMachineId: id,
      isDetailsOpen: true,
      selectedConnectionId: null,
    }),

  endMachineDrag: () =>
    set({
      draggingMachineId: null,
      orbitBlocked: false,
    }),

  startConnectionDraft: (sourceId) =>
    set({
      connectionDraft: { sourceId },
      orbitBlocked: true,
      selectedMachineId: sourceId,
      isDetailsOpen: true,
      selectedConnectionId: null,
    }),

  setConnectionDraftEnd: (point) => set({ connectionDraftEnd: point }),

  setConnectionHoverTarget: (id) => set({ connectionHoverTargetId: id }),

  cancelConnectionDraft: () =>
    set({
      connectionDraft: null,
      connectionHoverTargetId: null,
      orbitBlocked: false,
    }),

  completeConnectionDraft: (targetId) => {
    const draft = get().connectionDraft;
    if (!draft || draft.sourceId === targetId) {
      set({ connectionDraft: null, connectionHoverTargetId: null, orbitBlocked: false });
      return false;
    }
    get().addConnection(draft.sourceId, targetId);
    set({
      connectionDraft: null,
      connectionHoverTargetId: null,
      orbitBlocked: false,
    });
    return true;
  },

  selectMachine: (id) =>
    set((state) => {
      const focus = id ? state.machines.find((x) => x.id === id)?.position : null;
      return {
        selectedMachineId: id,
        isDetailsOpen: !!id,
        selectedConnectionId: null,
        cameraFocus: focus ? [...focus] : null,
      };
    }),

  selectConnection: (id) =>
    set((state) => {
      const c = state.connections.find((x) => x.id === id);
      let cameraFocus = null;
      if (c) {
        const a = state.machines.find((m) => m.id === c.source);
        const b = state.machines.find((m) => m.id === c.target);
        if (a && b) {
          cameraFocus = [
            (a.position[0] + b.position[0]) / 2,
            0,
            (a.position[2] + b.position[2]) / 2,
          ];
        }
      }
      return {
        selectedConnectionId: id,
        selectedMachineId: null,
        isDetailsOpen: !!id,
        cameraFocus,
      };
    }),

  clearCanvasSelection: () =>
    set({
      selectedMachineId: null,
      selectedConnectionId: null,
      isDetailsOpen: false,
      cameraFocus: null,
    }),

  updateMachineStatus: (id, status) =>
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, status } : m)),
    })),

  addConnection: (source, target) =>
    set((state) => {
      if (source === target) return state;
      if (state.connections.some((c) => c.source === source && c.target === target)) return state;
      const conn = {
        id: uuidv4(),
        source,
        target,
        createdAt: Date.now(),
      };
      return {
        connections: [...state.connections, conn],
        selectedConnectionId: conn.id,
        selectedMachineId: null,
        isDetailsOpen: true,
      };
    }),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      selectedConnectionId: state.selectedConnectionId === id ? null : state.selectedConnectionId,
      isDetailsOpen: state.selectedConnectionId === id ? false : state.isDetailsOpen,
    })),

  rerouteConnection: (connectionId, newTargetId) =>
    set((state) => {
      const c = state.connections.find((x) => x.id === connectionId);
      if (!c || c.source === newTargetId) return state;
      if (
        state.connections.some(
          (x) => x.source === c.source && x.target === newTargetId && x.id !== connectionId
        )
      ) {
        return state;
      }
      return {
        connections: state.connections.map((x) =>
          x.id === connectionId ? { ...x, target: newTargetId } : x
        ),
      };
    }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setDetailsOpen: (isOpen) => set({ isDetailsOpen: isOpen }),

  updateTelemetry: () =>
    set((state) => ({
      machines: state.machines.map((m) => {
        const newRpm =
          m.status === 'RUNNING' ? Math.max(0, m.telemetry.rpm + (Math.random() * 100 - 50)) : 0;
        const newTemp =
          m.status === 'RUNNING'
            ? Math.max(30, m.telemetry.temp + (Math.random() * 2 - 1))
            : m.telemetry.temp - 0.1;
        const queueDrift =
          m.status === 'RUNNING'
            ? Math.max(0, Math.min(14, m.telemetry.queue + Math.floor(Math.random() * 3) - 1))
            : m.telemetry.queue;

        let newStatus = m.status;
        let newLogs = [...m.logs];

        if (Math.random() > 0.98 && m.status === 'RUNNING') {
          const issues = ['WARNING', 'ERROR', 'IDLE', 'MAINTENANCE'];
          newStatus = issues[Math.floor(Math.random() * issues.length)];
          newLogs.unshift({
            time: new Date().toLocaleTimeString(),
            message: `Status changed to ${newStatus}: ${
              newStatus === 'ERROR'
                ? 'Mechanical failure'
                : newStatus === 'MAINTENANCE'
                  ? 'Scheduled service window'
                  : 'Queue / process anomaly'
            }`,
            type: newStatus === 'ERROR' ? 'ERROR' : 'WARNING',
          });
        } else if (Math.random() > 0.95 && m.status !== 'RUNNING') {
          newStatus = 'RUNNING';
          newLogs.unshift({
            time: new Date().toLocaleTimeString(),
            message: 'Recovered to normal operation',
            type: 'INFO',
          });
        }

        const throughputBase = newStatus === 'RUNNING' ? Math.min(120, (newRpm / 2000) * 100) : 0;

        return {
          ...m,
          status: newStatus,
          telemetry: {
            ...m.telemetry,
            rpm: Math.round(newRpm),
            temp: Math.round(newTemp * 10) / 10,
            stitchCount: m.telemetry.stitchCount + (m.status === 'RUNNING' ? 5 : 0),
            queue: queueDrift,
            throughput: Math.round(throughputBase + (Math.random() * 6 - 3)),
          },
          logs: newLogs.slice(0, 50),
        };
      }),
    })),
}));
