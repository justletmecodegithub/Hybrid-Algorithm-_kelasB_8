(function () {
  window.HybridCloud = window.HybridCloud || {};

  // Sesuaikan nilai tasks & vms dengan dataset Minggu 3 milikmu
  const WEEK3_DATASET = {
    name: 'Dataset Minggu 3',
    vms: [
      { id: 'VM-1', mips: 1500, costPerSec: 0.04 },
      { id: 'VM-2', mips: 2000, costPerSec: 0.06 },
      { id: 'VM-3', mips: 2500, costPerSec: 0.08 },
      { id: 'VM-4', mips: 3000, costPerSec: 0.10 }
    ],
    tasks: [
      { id: 'T01', lengthMI: 4500 }, { id: 'T02', lengthMI: 7200 },
      { id: 'T03', lengthMI: 3100 }, { id: 'T04', lengthMI: 8900 },
      { id: 'T05', lengthMI: 5400 }, { id: 'T06', lengthMI: 6200 },
      { id: 'T07', lengthMI: 2800 }, { id: 'T08', lengthMI: 9100 },
      { id: 'T09', lengthMI: 4900 }, { id: 'T10', lengthMI: 6700 },
      { id: 'T11', lengthMI: 3800 }, { id: 'T12', lengthMI: 7500 },
      { id: 'T13', lengthMI: 5100 }, { id: 'T14', lengthMI: 8200 },
      { id: 'T15', lengthMI: 4200 }, { id: 'T16', lengthMI: 6900 }
    ]
  };

  function evaluateSchedule(schedule, dataset = WEEK3_DATASET) {
    const vmLoad = new Array(dataset.vms.length).fill(0);
    const vmBlocks = dataset.vms.map(() => []);

    for (let tIdx = 0; tIdx < dataset.tasks.length; tIdx++) {
      const vmIdx = schedule[tIdx] % dataset.vms.length;
      const task = dataset.tasks[tIdx];
      const vm = dataset.vms[vmIdx];
      const execTime = task.lengthMI / vm.mips;
      const start = vmLoad[vmIdx];
      const end = start + execTime;

      vmBlocks[vmIdx].push({
        taskId: task.id,
        start,
        end,
        duration: execTime
      });
      vmLoad[vmIdx] = end;
    }

    const makespan = Math.max(...vmLoad);
    const totalCost = vmLoad.reduce((acc, load, idx) => acc + load * dataset.vms[idx].costPerSec, 0);
    return { makespan, totalCost, vmLoad, vmBlocks };
  }

  window.HybridCloud.WEEK3_DATASET = WEEK3_DATASET;
  window.HybridCloud.evaluateSchedule = evaluateSchedule;
})();
