<template>
  <div class="report-container">
    <div v-if="!report">
      <p>Loading report...</p>
    </div>

    <div v-else>
      <!-- Logo + Date/Shift Header -->
      <div class="header">
        <img src="/newLogo.png" alt="Kwik Tips Logo" class="logo" />
        <div class="date-shift">
          <p>{{ report.date }} {{ report.shiftType }}</p>
        </div>
      </div>

      <!-- Shared Tip Summary -->
      <div class="summary-section">
        <h3>Tip Summary</h3>
        <table class="summary-table">
          <tr>
            <th>Total Cash Tips</th>
            <td>${{ (report.totalCashTips ?? 0).toFixed(2) }}</td>
            <th>Total Credit Card Tips</th>
            <td>${{ (report.totalCcTips ?? 0).toFixed(2) }}</td>
          </tr>

        </table>
      </div>

      <!-- Barbacks -->


      <div v-if="report.barbacks && report.barbacks.length" class="no-break">
        <h3>Barbacks</h3>

        <!-- Barback Hourly Summary -->
        <table class="summary-table">
          <tr>
            <th>Cash Hourly</th>
            <td>${{ (report.barbackCashHourly ?? 0).toFixed(2) }}</td>
            <th>CC Hourly</th>
            <td>${{ (report.barbackCcHourly ?? 0).toFixed(2) }}</td>
          </tr>
          <tr>
            <th>Cash Tip-Out %</th>
            <td>{{ (report.barbackCashTipPercentage ?? 0).toFixed(2) }}%</td>
            <th>CC Tip-Out %</th>
            <td>{{ (report.barbackCcTipPercentage ?? 0).toFixed(2) }}%</td>
          </tr>
        </table>

        <table class="data-table no-break">
          <thead>
            <tr>
              <th>Name</th>
              <th>Shift Length</th>
              <th>Cash Tips</th>
              <th>Credit Card Tips</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(barback, index) in report.barbacks" :key="'barback-' + index">
              <td>{{ barback.barbackName }}</td>
              <td>{{ barback.barbackShiftHours }}</td>
              <td>${{ (barback.barbackCashTips ?? 0).toFixed(2) }}</td>
              <td>${{ (barback.barbackCcTips ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>


      </div>

      <!-- Food Runners -->
      <div v-if="report.foodRunners && report.foodRunners.length" class="no-break">
        <h3>Runners</h3>
        <table class="data-table no-break">
          <thead>
            <tr>
              <th>#</th>
              <th>Sales</th>
              <th>Tip-Out %</th>
              <th>Amount Owed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(runner, index) in report.foodRunners" :key="'runner-' + index">
              <td>{{ index + 1 }}</td>
              <td>${{ (runner.foodSales ?? 0).toFixed(2) }}</td>
              <td>{{ (runner.foodRunnerTipPercentage ?? 0).toFixed(2) }}%</td>
              <td>${{ (runner.foodRunnerTipAmount ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bartenders -->
      <div v-if="report.bartenders && report.bartenders.length" class="no-break">
        <h3>Bartenders</h3>

        <!-- Bartender Hourly Summary Table -->
        <table class="summary-table">
          <tr>
            <th>Cash Hourly</th>
            <td>${{ (report.bartenderCashHourly ?? 0).toFixed(2) }}</td>
            <th>CC Hourly</th>
            <td>${{ (report.bartenderCcHourly ?? 0).toFixed(2) }}</td>
          </tr>
        </table>

        <!-- Bartender Breakdown Table -->
        <table class="data-table no-break">
          <thead>
            <tr>
              <th>Name</th>
              <th>Hours Worked</th>
              <th>Cash Tips</th>
              <th>Credit Card Tips</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(bartender, index) in report.bartenders" :key="'bartender-' + index">
              <td>{{ bartender.name }}</td>
              <td>{{ bartender.hoursWorked }}</td>
              <td>${{ (bartender.cashTips ?? 0).toFixed(2) }}</td>
              <td>${{ (bartender.ccTips ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Server Report Only -->
      <div v-if="isServerReport">
        <h3>Bar Tip-Out</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Alcohol Sales</th>
              <th>Tip-Out %</th>
              <th>Amount Owed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${{ (report.alcoholSales ?? 0).toFixed(2) }}</td>
              <td>{{ (report.alcoholTipPercentage ?? 0).toFixed(2) }}%</td>
              <td>${{ (report.totalPayout ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Total Tips After Tip-Outs -->
        <div v-if="report.totalAfterTipOuts !== undefined" class="summary-after-tip-outs">
          <strong>Total Tips (After Tip-Outs):</strong>
          <span>${{ formatCurrency(report.totalAfterTipOuts) }}</span>
        </div>


      </div>

      <!-- Buttons -->
      <div class="button-group">
        <button @click="downloadReport">Download Report</button>
        <button @click="goToForm">Create Another Report</button>
      </div>
    </div>
  </div>
</template>








<script>
import axios from 'axios';
import * as html2pdf from 'html2pdf.js';

export default {
  data() {
    return {
      report: null, // The generated report data
      isServerReport: false, // Flag to check if the report is from the server
    };
  },
  created() {

    this.fetchReport();
  },
  methods: {
    // Fetch the generated report from the backend
    fetchReport() {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
      const reportId = this.$route.params.id;

      // Step 1: Get the base report to determine its type
      axios.get(`https://kwik-tips-backend.uk.r.appspot.com/api/tip-reports/${reportId}`, { headers })
        .then(response => {
          const rawReport = response.data;
          const reportType = rawReport.reportType;

          if (reportType && reportType.toLowerCase() === 'server') {
            this.isServerReport = true;
            return axios.get(`https://kwik-tips-backend.uk.r.appspot.com/api/tip-reports/server/${reportId}`, { headers });
          } else {
            this.isServerReport = false;
            return axios.get(`https://kwik-tips-backend.uk.r.appspot.com/api/tip-reports/bartender/${reportId}`, { headers });
          }
        })
        .then(response => {
          console.log('Report fetched:', response.data);
          this.report = response.data;
        })
        .catch(error => {
          console.error('Error fetching report:', error);
        });
    }
    ,

    // Function to download the report (optional)
    downloadReport() {
      const element = document.querySelector('.report-container');
      const buttons = document.querySelector('.button-group');

      // Hide buttons before generating PDF
      if (buttons) {
        buttons.style.display = 'none';
      }

      const opt = {
        filename: 'tip_report.pdf',
        html2canvas: {
          scale: 2,
          useCORS: true
        },
        jsPDF: {
          unit: 'px',
          format: [794, 1123],
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: ['.no-break']
        }
      };

      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
          }
        })
        .save()
        .then(() => {
          // Show buttons again after download
          if (buttons) {
            buttons.style.display = 'flex';
          }
        });
    },

    goToForm() {
      this.$router.push({ name: 'generateReport' });
    },

    formatCurrency(amount) {
      if (amount == null) return '$0.00';
      return Number(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    }

  },
};
</script>

<style scoped>
.report-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.logo {
  height: 180px;
}

.summary-table,
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.summary-table th,
.data-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  padding: 10px;
  border: 1px solid #ddd;
}

.summary-table td,
.data-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

.section-title {
  margin-top: 40px;
  font-size: 1.5rem;
  color: #333;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

button {
  background-color: #0077cc;
  color: white;
  padding: 10px 20px;
  border: none;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #005fa3;
}

@media print {
  .no-break {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}

.summary-after-tip-outs {
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: right;
  color: #0077cc;
}

</style>