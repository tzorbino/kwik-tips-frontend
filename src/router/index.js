import { createRouter, createWebHistory } from 'vue-router';
import TipReportForm from '../components/TipReportForm.vue'; // Correct path to TipReportForm

const routes = [
  {
    path: '/',
    name: 'generateReport',
    component: TipReportForm, // The component used to generate the report
  },
  {
    path: '/view-report/:id',
    name: 'viewReport',
    component: () => import('../components/TipReport.vue'), // Lazy load the component for viewing the report
    props: true, // Pass route params as props to the component
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
