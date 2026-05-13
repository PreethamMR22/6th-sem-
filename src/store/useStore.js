import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useStore = create((set, get) => ({
  machines: [],
  connections: [],
  selectedMachineId: null,
  isSidebarOpen: true,
  isDetailsOpen: false,

  addMachine: (type, position = null) => set((state) => {
    const finalPosition = position || [
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    ];
    const newMachine = {
      id: uuidv4(),
      type: type.id,
      name: `${type.name} #${state.machines.filter(m => m.type === type.id).length + 1}`,
      position: finalPosition,
      status: 'RUNNING',
      telemetry: {
        rpm: Math.floor(Math.random() * 2000) + 1000,
        temp: Math.floor(Math.random() * 30) + 40,
        efficiency: 95,
        stitchCount: 0,
        queue: Math.floor(Math.random() * 5),
      },
      logs: [
        { time: new Date().toLocaleTimeString(), message: 'System initialized', type: 'INFO' }
      ]
    };
    return { 
      machines: [...state.machines, newMachine],
      selectedMachineId: newMachine.id,
      isDetailsOpen: true
    };
  }),

  removeMachine: (id) => set((state) => ({
    machines: state.machines.filter((m) => m.id !== id),
    connections: state.connections.filter((c) => c.source !== id && c.target !== id),
    selectedMachineId: state.selectedMachineId === id ? null : state.selectedMachineId,
    isDetailsOpen: state.selectedMachineId === id ? false : state.isDetailsOpen
  })),

  updateMachinePosition: (id, position) => set((state) => ({
    machines: state.machines.map((m) => m.id === id ? { ...m, position } : m)
  })),

  selectMachine: (id) => set({ 
    selectedMachineId: id,
    isDetailsOpen: !!id
  }),

  updateMachineStatus: (id, status) => set((state) => ({
    machines: state.machines.map((m) => m.id === id ? { ...m, status } : m)
  })),

  addConnection: (source, target) => set((state) => {
    // Prevent duplicate connections
    if (state.connections.find(c => c.source === source && c.target === target)) return state;
    return {
      connections: [...state.connections, { id: uuidv4(), source, target }]
    };
  }),

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter(c => c.id !== id)
  })),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setDetailsOpen: (isOpen) => set({ isDetailsOpen: isOpen }),

  updateTelemetry: () => set((state) => ({
    machines: state.machines.map(m => {
      // Simulate telemetry changes
      const newRpm = m.status === 'RUNNING' ? Math.max(0, m.telemetry.rpm + (Math.random() * 100 - 50)) : 0;
      const newTemp = m.status === 'RUNNING' ? Math.max(30, m.telemetry.temp + (Math.random() * 2 - 1)) : m.telemetry.temp - 0.1;
      
      // Random anomalies
      let newStatus = m.status;
      let newLogs = [...m.logs];
      
      if (Math.random() > 0.98 && m.status === 'RUNNING') {
        const issues = ['WARNING', 'ERROR', 'IDLE'];
        newStatus = issues[Math.floor(Math.random() * issues.length)];
        newLogs.unshift({ 
          time: new Date().toLocaleTimeString(), 
          message: `Status changed to ${newStatus}: ${newStatus === 'ERROR' ? 'Mechanical failure' : 'Queue full'}`,
          type: newStatus === 'ERROR' ? 'ERROR' : 'WARNING'
        });
      } else if (Math.random() > 0.95 && m.status !== 'RUNNING') {
        newStatus = 'RUNNING';
        newLogs.unshift({ 
          time: new Date().toLocaleTimeString(), 
          message: 'Recovered to normal operation',
          type: 'INFO'
        });
      }

      return {
        ...m,
        status: newStatus,
        telemetry: {
          ...m.telemetry,
          rpm: Math.round(newRpm),
          temp: Math.round(newTemp * 10) / 10,
          stitchCount: m.telemetry.stitchCount + (m.status === 'RUNNING' ? 5 : 0)
        },
        logs: newLogs.slice(0, 50) // Keep last 50 logs
      };
    })
  }))
}));
