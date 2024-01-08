const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
let chart = null;

function setMinMaxDates(logs) {
    if (logs.length) {
        const firstLogDate = new Date(logs[0].timestamp * 1000);
        const lastLogDate = new Date(logs[logs.length - 1].timestamp * 1000);

        // Add one day to the lastLogDate
        lastLogDate.setDate(lastLogDate.getDate() + 1);

        startDateInput.min = firstLogDate.toISOString().split('T')[0];
        startDateInput.max = lastLogDate.toISOString().split('T')[0];
        endDateInput.min = firstLogDate.toISOString().split('T')[0];
        endDateInput.max = lastLogDate.toISOString().split('T')[0];
    }
}

function fetchDataAndRenderChart() {
    fetch('/logs')
        .then(response => response.json())
        .then(logs => {
            // Sort logs by timestamp to ensure correct order
            logs.sort((a, b) => a.timestamp - b.timestamp);
            setMinMaxDates(logs);

            let hourlyCountsApp1 = {};
            let hourlyCountsApp2 = {};

            logs.forEach(log => {
                const date = new Date(log.timestamp * 1000);
                const fullDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;

                if (!startDateInput.value || !endDateInput.value || (fullDateString >= startDateInput.value && fullDateString <= endDateInput.value + " 23:59")) {
                    if (log.app === 'Klero-extention') {
                        hourlyCountsApp1[fullDateString] = (hourlyCountsApp1[fullDateString] || 0) + 1;
                    } else if (log.app === 'Notaire-ciclade') {
                        hourlyCountsApp2[fullDateString] = (hourlyCountsApp2[fullDateString] || 0) + 1;
                    }
                }
            });

            // Create unique labels from the keys of both application counts
            const uniqueLabels = Array.from(new Set(Object.keys(hourlyCountsApp1).concat(Object.keys(hourlyCountsApp2)))).sort();

            const ctx = document.getElementById('statsChart').getContext('2d');
            if (chart) {
                chart.destroy();
            }
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: uniqueLabels,
                    datasets: [
                        {
                            label: 'Klero-extention',
                            data: uniqueLabels.map(key => hourlyCountsApp1[key] || 0),
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Notaire-ciclade',
                            data: uniqueLabels.map(key => hourlyCountsApp2[key] || 0),
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });
}

startDateInput.addEventListener('change', fetchDataAndRenderChart);
endDateInput.addEventListener('change', fetchDataAndRenderChart);
fetchDataAndRenderChart(); // Initial chart rendering