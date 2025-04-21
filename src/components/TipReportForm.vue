<template>
  <div class="form-wrapper">
    <img src="/newLogo.png" alt="Kwik Tips Logo" class="form-logo" />

    <form @submit.prevent="submitForm" class="tip-form">
      <!-- Date & Shift -->
      <div class="form-row">
        <div class="form-group">
          <label for="date">Date</label>
          <input type="date" v-model="form.date" required />
        </div>
        <div class="form-group">
          <label for="shift">Shift</label>
          <select v-model="form.shift" required>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <!-- Tip Totals -->
      <div class="form-row">
        <div class="form-group">
          <label>Total Cash Tips</label>
          <input type="number" v-model="form.cashTips" placeholder="Cash tips" />
        </div>
        <div class="form-group">
          <label>Total Credit Card Tips</label>
          <input type="number" step="0.01" inputmode="decimal" lang="en" v-model="form.ccTips" placeholder="CC tips" />
        </div>
      </div>

      <div class="form-group">
        <label for="reportType">Report Type:</label>
        <select v-model="form.reportType" required>
          <option value="bartender">Bartender Report</option>
          <option value="server">Server Report</option>
        </select>
      </div>


      <!-- Server-specific: Alcohol Sales + Bar Tip-Out -->
      <div v-if="form.reportType === 'server'" class="form-section">
        <h3>Bar Tip-Out</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="alcoholSales">Alcohol Sales</label>
            <input type="number" step="0.01" inputmode="decimal" lang="en" v-model="form.alcoholSales"
              placeholder="Enter alcohol sales" />
          </div>
          <div class="form-group">
            <label for="barTipOutPercent">Bar Tip-Out %</label>
            <input type="number" step="0.01" inputmode="decimal" lang="en" v-model="form.barTipOutPercentage"
              placeholder="Enter % tip-out to bar" />
          </div>
        </div>
      </div>

      <!-- Food Runner -->
      <div class="form-section">
        <h3>Runners</h3>
        <button type="button" @click="addFoodRunner">Add Runner</button>
        <div v-for="(foodRunner, index) in form.foodRunners" :key="'foodRunner-' + index">
          <div class="form-row">
            <div class="form-group">
              <label>Sales</label>
              <input type="number" step="0.01" inputmode="decimal" lang="en" v-model="foodRunner.foodSales" required />
            </div>
            <div class="form-group">
              <label>Tip %</label>
              <input type="number" step="0.01" inputmode="decimal" lang="en" v-model="foodRunner.foodRunnerTip"
                required />
            </div>
            <button type="button" class="remove-btn" @click="removeFoodRunner(index)">Remove</button>
          </div>
        </div>
      </div>

      <div v-if="form.reportType === 'bartender'">

        <!-- Barbacks -->
        <div class="form-section">
          <h3>Barbacks</h3>

          <!-- Add Button First -->
          <button type="button" @click="addBarback">Add Barback</button>

          <!-- Tip-Out Percentages - show only if barbacks exist, but above the form -->
          <div class="form-row" v-if="form.barbacks.length > 0" style="margin-top: 10px;">

            <div class="form-group">
              <label>Barback Cash Tip-Out %</label>
              <input type="number" step="0.01" inputmode="decimal" lang="en" v-model="form.barbackCashTipPercentage"
                placeholder="e.g. 15" />
            </div>
            <div class="form-group">
              <label>Barback CC Tip-Out %</label>
              <input type="number" step="0.01" inputmode="decimal" lang="en" v-model="form.barbackCcTipPercentage"
                placeholder="e.g. 15" />
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label>Shift Length</label>
              <input type="number" step="0.1" inputmode="decimal" lang="en" v-model.number="form.barbackShiftLength"
                placeholder="e.g. 7" required />
            </div>

          </div>

          <!-- Barback Inputs -->
          <div v-for="(barback, index) in form.barbacks" :key="'barback-' + index">
            <div class="form-row">
              <div class="form-group">
                <label>Name</label>
                <input type="text" v-model="barback.name" required />
              </div>
              <div class="form-group">
                <label>Time In</label>
                <input type="time" v-model="barback.timeIn" required />
              </div>
              <div class="form-group">
                <label>Time Out</label>
                <input type="time" v-model="barback.timeOut" required />
              </div>

              <button type="button" class="remove-btn" @click="removeBarback(index)">Remove</button>
            </div>
          </div>
        </div>


        <!-- Bartenders -->
        <div class="form-section">
          <h3>Bartenders</h3>
          <button type="button" @click="addBartender">Add Bartender</button>
          <div v-for="(bartender, index) in form.bartenders" :key="'bartender-' + index">
            <div class="form-row">
              <div class="form-group">
                <label>Name</label>
                <input type="text" v-model="bartender.name" required />
              </div>
              <div class="form-group">
                <label>Time In</label>
                <input type="time" v-model="bartender.timeIn" required />
              </div>
              <div class="form-group">
                <label>Time Out</label>
                <input type="time" v-model="bartender.timeOut" required />
              </div>
              <button type="button" class="remove-btn" @click="removeBartender(index)">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="form-submit">
        <button type="submit" class="submit-btn">Generate Report</button>
      </div>
    </form>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      form: {
        date: '',
        shift: 'AM',
        reportType: 'bartender',
        cashTips: '',
        ccTips: '',
        alcoholSales: '',
        barTipOutPercentage: null,
        barbackCashTipPercentage: null,
        barbackCcTipPercentage: null,
        barbackShiftLength: null, // New field for barback shift length
        foodSales: '',
        foodRunnerTip: '',
        foodRunners: [],  // Empty array for multiple food runners
        barbacks: [],  // Array for multiple barbacks
        bartenders: [], // Array for multiple bartenders
      },
      showFoodRunner: false,  // Initially, food runner section is hidden
      showBarback: false,  // Initially, barback section is hidden
      showBartender: false,  // Initially, bartender section is hidden
    };
  },
  methods: {
    submitForm() {
      const reportDate = this.form.date;

      // Helper to calculate if outTime should be next day
      const adjustTime = (inTime, outTime) => {
        let outDate = reportDate;
        if (outTime < inTime) {
          const nextDay = new Date(new Date(reportDate).getTime() + 24 * 60 * 60 * 1000);
          outDate = nextDay.toISOString().split("T")[0];
        }
        return outDate;
      };

      const reportData = {
        date: reportDate,
        shift: this.form.shift,
        cashTips: this.form.cashTips,
        ccTips: this.form.ccTips,
        reportType: this.form.reportType,
        alcoholSales: this.form.alcoholSales,
        barTipOutPercentage: parseFloat(this.form.barTipOutPercentage),
        barbackCashTipPercentage: parseFloat(this.form.barbackCashTipPercentage),
        barbackCcTipPercentage: parseFloat(this.form.barbackCcTipPercentage),
        barbackShiftLength: parseFloat(this.form.barbackShiftLength), // shared value for all barbacks
        foodSales: this.form.foodSales,
        foodRunnerTip: this.form.foodRunnerTip,
        foodRunners: this.form.foodRunners.map(foodRunner => ({
          foodSales: foodRunner.foodSales,
          foodRunnerTip: foodRunner.foodRunnerTip,
        })),
        barbacks: this.form.barbacks.map(barback => {
          const outDate = adjustTime(barback.timeIn, barback.timeOut);
          return {
            name: barback.name,
            timeIn: `${reportDate}T${barback.timeIn}:00`,
            timeOut: `${outDate}T${barback.timeOut}:00`,
            shiftLength: this.form.barbackShiftLength // shared value for all barbacks
          };
        }),
        bartenders: this.form.bartenders.map(bartender => {
          const outDate = adjustTime(bartender.timeIn, bartender.timeOut);
          return {
            name: bartender.name,
            timeIn: `${reportDate}T${bartender.timeIn}:00`,
            timeOut: `${outDate}T${bartender.timeOut}:00`,
          };
        }),
      };

      const headers = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Sending reportData:', reportData);

      axios.post('https://kwik-tips-backend.uk.r.appspot.com/api/tip-reports/generate', reportData, { headers })
        .then(response => {
          console.log('Report saved:', response.data);
          const reportId = response.data.id;
          this.$router.push({ name: 'viewReport', params: { id: reportId } });
        })
        .catch(error => {
          console.error('There was an error saving the report:', error);
          alert('Failed to save the report');
        });
    },

    addFoodRunner() {
      this.form.foodRunners.push({
        foodSales: '',
        foodRunnerTip: '',
      });
    },
    removeFoodRunner(index) {
      this.form.foodRunners.splice(index, 1);
    },
    addBarback() {
      this.form.barbacks.push({
        name: '',
        timeIn: '',
        timeOut: '',
        shiftLength: null,
      });
    },
    removeBarback(index) {
      this.form.barbacks.splice(index, 1);
    },
    addBartender() {
      this.form.bartenders.push({
        name: '',
        timeIn: '',
        timeOut: '',
      });
    },
    removeBartender(index) {
      this.form.bartenders.splice(index, 1);
    },

    getBarbackRatio(barback) {
      if (!barback.timeIn || !barback.timeOut || !this.form.barbackShiftLength) return '';

      const [inH, inM] = barback.timeIn.split(':').map(Number);
      const [outH, outM] = barback.timeOut.split(':').map(Number);

      let hours = outH + outM / 60 - (inH + inM / 60);
      if (hours < 0) hours += 24;

      return `${hours.toFixed(1)} / ${this.form.barbackShiftLength}`;
    }



  },
};
</script>

<style scoped>
* {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-wrapper {
  max-width: 750px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

body {
  background-color: #FAFAF5;
  /* Light background */
  margin: 0;
  padding: 0;
}

.form-logo {
  display: block;
  max-width: 200px;
  margin: 0 auto 2rem;
}

.tip-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-group {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.4rem;
  font-weight: 600;
}

input,
select {
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.form-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f7f7f7;
  border-radius: 12px;
}

.form-section h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.remove-btn {
  margin-top: 0.5rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.remove-btn:hover {
  background-color: #e74c3c;
}

.form-submit {
  text-align: center;
  margin-top: 2rem;
}

.submit-btn {
  padding: 0.8rem 2rem;
  background-color: #33b37a;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #28a06a;
}

button {
  background-color: #184B74;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease-in-out;
}

button:hover {
  background-color: #45a049;
}
</style>