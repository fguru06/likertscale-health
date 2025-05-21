<template>
  <div class="likert-results">
    <h2>Survey Results Overview</h2>
    <div v-if="loading" class="loading">Loading results...</div>
    <div v-else-if="averages.length === 0">No survey results yet.</div>
    <div v-else>
      <div class="results-chart">
        <SurveyResultsChart :questions="questions" :responses="averages" />
      </div>
      <ul class="averages-list">
        <li v-for="(avg, idx) in averages" :key="idx">
          <strong>{{ questions[idx].text }}</strong>: <span class="avg-value">{{ avg.toFixed(2) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import SurveyResultsChart from './SurveyResultsChart.vue'

const questions = [
  { text: 'How confident do you feel about your nursing skills?' },
  { text: 'How satisfied are you with the course content?' },
  { text: 'How likely are you to recommend this course to others?' },
]

const averages = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  const snapshot = await getDocs(collection(db, 'surveyResults'))
  const allResponses = []
  snapshot.forEach(doc => {
    if (Array.isArray(doc.data().responses)) {
      allResponses.push(doc.data().responses.map(Number))
    }
  })
  if (allResponses.length > 0) {
    // Calculate average for each question
    const numQuestions = questions.length
    const sums = Array(numQuestions).fill(0)
    allResponses.forEach(resArr => {
      resArr.forEach((val, idx) => {
        if (!isNaN(val)) sums[idx] += val
      })
    })
    averages.value = sums.map(sum => sum / allResponses.length)
  } else {
    averages.value = []
  }
  loading.value = false
})
</script>

<style scoped>
.likert-results {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 #e0e7ef33;
}
.loading {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
}
.results-chart {
  margin-bottom: 2rem;
}
.averages-list {
  list-style: none;
  padding: 0;
}
.averages-list li {
  margin-bottom: 1rem;
  font-size: 1.08rem;
}
.avg-value {
  color: #42b883;
  font-weight: bold;
  margin-left: 0.5em;
}
</style>
