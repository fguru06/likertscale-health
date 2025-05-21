<template>
  <div>
    <div class="instructions">
      <h2>Instructions</h2>
      <p>
        This is your survey results. If you would like to see the average scores from all entries, click the button below.
      </p>
    </div>
    <h3 id="results-heading">Survey Results</h3>
    <div id="likert-highchart" class="highchart-container" tabindex="0" aria-label="Likert survey results chart"></div>
    <button @click="fetchAndShowAverages" class="avg-btn" aria-label="Show average for all entries">Show All Entries Average</button>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick, ref } from 'vue'
import Highcharts from 'highcharts'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const props = defineProps({
  questions: Array,
  responses: Array
})

const showingAverages = ref(false)

function renderChart(data, categories, isAverage = false) {
  Highcharts.chart('likert-highchart', {
    chart: {
      type: 'bar',
      backgroundColor: '#fafcff',
      style: { fontFamily: 'inherit' }
    },
    title: { text: isAverage ? 'Average Scores (All Entries)' : null },
    xAxis: {
      categories,
      title: { text: null },
      labels: { style: { fontSize: '1rem' } },
      accessibility: { description: 'Survey questions' }
    },
    yAxis: {
      min: 1,
      max: 5,
      tickInterval: 1,
      title: { text: 'Score', align: 'high' },
      labels: { overflow: 'justify' },
      accessibility: { description: 'Likert scale score' }
    },
    legend: { enabled: false },
    plotOptions: {
      bar: {
        dataLabels: { enabled: true },
        groupPadding: 0.1,
        pointPadding: 0.1
      },
      series: {
        animation: { duration: 1000 },
        allowPointSelect: true,
        borderRadius: 6,
        accessibility: {
          pointDescriptionFormatter: function(point) {
            return `${point.category}: ${point.y}`
          }
        }
      }
    },
    series: [{
      name: isAverage ? 'Average Score' : 'Score',
      data,
      color: isAverage ? '#0077cc' : '#42b883'
    }],
    credits: { enabled: false },
    accessibility: {
      enabled: true,
      description: isAverage ? 'Bar chart showing average survey results' : 'Bar chart showing survey results',
      point: { valueDescriptionFormat: '{x}: {y}' }
    }
  })
}

async function fetchAndShowAverages() {
  const qSnapshot = await getDocs(collection(db, 'surveyResults'))
  const allResponses = []
  const debugDocs = []
  qSnapshot.forEach(doc => {
    const data = doc.data()
    debugDocs.push(data)
    const resp = data.responses
    // Defensive: Only accept arrays of correct length
    if (Array.isArray(resp) && resp.length === props.questions.length) {
      allResponses.push(resp.map(Number))
    }
  })
  console.log('Fetched surveyResponses documents:', debugDocs)
  if (!allResponses.length) {
    alert('No valid survey data found to calculate averages. Check the console for details.')
    return
  }
  // Calculate average per question
  const numQuestions = props.questions.length
  const sums = Array(numQuestions).fill(0)
  allResponses.forEach(respArr => {
    respArr.forEach((val, idx) => {
      sums[idx] += Number(val)
    })
  })
  const averages = sums.map(sum => Number((sum / allResponses.length).toFixed(2)))
  console.log('Averages per question:', averages)
  showingAverages.value = true
  renderChart(averages, props.questions.map(q => q.text), true)
}

function renderDefaultChart() {
  renderChart(props.responses.map(Number), props.questions.map(q => q.text), false)
}

onMounted(() => {
  nextTick(() => renderDefaultChart())
})

watch(() => props.responses, () => {
  if (!showingAverages.value) {
    nextTick(() => renderDefaultChart())
  }
}, { deep: true })
</script>

<style scoped>
.instructions {
  background: #eaf6ff;
  border-radius: 10px;
  padding: 1.2rem 1.5rem 1.2rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px 0 #e0e7ef11;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.instructions h2 {
  margin-top: 0;
  font-size: 1.3rem;
  color: #1a237e;
}
.instructions p {
  margin: 0.5rem 0 0 0;
  font-size: 1.08rem;
  color: #222;
}
.highchart-container {
  min-height: 220px;
  min-width: 220px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow-x: auto;
  outline: none;
  background: transparent;
  display: block;
}
.highchart-container:focus {
  box-shadow: 0 0 0 3px #42b88355;
}
.avg-btn {
  margin: 1.5rem auto 0 auto;
  display: block;
  background: #0077cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.avg-btn:hover, .avg-btn:focus {
  background: #005fa3;
  outline: 2px solid #005fa3;
}
</style>
