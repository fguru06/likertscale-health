<template>
  <div class="likert-survey">
    <div v-if="!showResults" class="instructions">
      <h2>Instructions</h2>
      <p>
        Please answer each question below by selecting the option that best reflects your opinion. After submitting your responses, you will see your individual results and can view the average scores from all students who have completed the survey so far.
      </p>
    </div>
    <h2 id="survey-heading">Health Care Nursing Course Survey</h2>
    <form v-if="!showResults" @submit.prevent="submitSurvey" aria-labelledby="survey-heading">
      <div v-for="(question, qIdx) in questions" :key="qIdx" class="question-block modern-flex">
        <div class="question-text">{{ question.text }}</div>
        <div class="likert-row modern-row" role="radiogroup" :aria-labelledby="'q' + qIdx">
          <label v-for="(option, oIdx) in likertOptions" :key="oIdx" :tabindex="0" class="likert-label">
            <input type="radio"
                   :name="'q' + qIdx"
                   :value="option.value"
                   v-model="responses[qIdx]"
                   required
                   :aria-checked="responses[qIdx] === option.value"
                   :aria-labelledby="'q' + qIdx + '-opt' + oIdx"
                   @keydown.enter.prevent="responses[qIdx] = option.value"
            />
            <span :id="'q' + qIdx + '-opt' + oIdx">{{ option.label }}</span>
          </label>
        </div>
      </div>
      <button type="submit" class="modern-btn">Submit</button>
    </form>
    <div v-if="loading" class="loading-indicator">Saving your responses...</div>
    <SurveyResultsChart v-else-if="showResults" :questions="questions" :responses="responses" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SurveyResultsChart from './SurveyResultsChart.vue'
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const questions = ref([
  { text: 'How confident do you feel about your nursing skills?' },
  { text: 'How satisfied are you with the course content?' },
  { text: 'How likely are you to recommend this course to others?' },
])

const likertOptions = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 },
]

const responses = ref(Array(questions.value.length).fill(null))
const showResults = ref(false)
const loading = ref(false)

async function submitSurvey() {
  loading.value = true;
  try {
    await addDoc(collection(db, 'surveyResults'), {
      responses: [...responses.value],
      timestamp: Date.now()
    });
    showResults.value = true;
  } catch (e) {
    alert('Error saving survey: ' + e.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.likert-survey {
  max-width: 700px;
  width: 100%;
  box-sizing: border-box;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 16px;
  background: #fafcff;
  box-shadow: 0 4px 24px 0 #e0e7ef33;
}
.instructions {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 10px;
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}
.question-block.modern-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.2rem 1rem;
  border-radius: 10px;
  background: #f4f8fb;
  box-shadow: 0 2px 8px 0 #e0e7ef11;
}
.question-text {
  flex: 1 1 220px;
  font-size: 1.13rem;
  font-weight: 500;
  color: #1a237e;
  text-align: left;
}
.likert-row.modern-row {
  flex: 2 1 320px;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.likert-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.2rem;
  font-size: 0.98rem;
  color: #374151;
  cursor: pointer;
  transition: color 0.2s;
}
.likert-label input[type="radio"] {
  accent-color: #42b883;
  width: 1.2em;
  height: 1.2em;
  margin-bottom: 0.2em;
  margin-top: 0.1em;
}
.likert-label input[type="radio"]:focus + span,
.likert-label:focus-within {
  outline: 2px solid #42b883;
  outline-offset: 2px;
  color: #42b883;
}
.modern-btn {
  margin-top: 1rem;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  border-radius: 6px;
  border: none;
  background: linear-gradient(90deg, #42b883 60%, #369870 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 8px 0 #42b88322;
  transition: background 0.2s, box-shadow 0.2s;
}
.modern-btn:hover, .modern-btn:focus {
  background: linear-gradient(90deg, #369870 60%, #42b883 100%);
  box-shadow: 0 4px 16px 0 #42b88333;
}
.loading-indicator {
  text-align: center;
  color: #0077cc;
  font-size: 1.15rem;
  margin: 2rem 0 1rem 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}
@media (max-width: 700px) {
  .likert-survey { padding: 1rem; }
  .question-block.modern-flex { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .likert-row.modern-row { justify-content: flex-start; }
}
</style>
