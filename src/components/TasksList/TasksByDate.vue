<template>
  <div class="w-full">
    <NavBarTasks
      id="NavBarByDate"
      class="pt-[8px]"
      :title="dateLabel"
    />
    <TasksListNew :new-task-props="newTaskProps" />
    <PropertiesRight />
  </div>
</template>

<script>
import TasksListNew from '../TasksListNew.vue'
import PropertiesRight from '../PropertiesRight.vue'
import NavBarTasks from '@/components/Navbar/NavBarTasks.vue'

export default {
  components: {
    TasksListNew,
    PropertiesRight,
    NavBarTasks
  },
  computed: {
    date () {
      return this.$route.params.date
    },
    dateLabel () {
      const date = new Date(this.date)
      const day = date.getDate()
      const month = date.toLocaleString('default', { month: 'short' })
      const weekday = date.toLocaleString('default', { weekday: 'short' })
      const dateLabelFormat = day + ' ' + month + ', ' + weekday
      return dateLabelFormat
    },
    newTaskProps () {
      const date = new Date(this.date)
      return ({
        date_begin: this.getDateString(date) + 'T00:00:00',
        date_end: this.getDateString(date) + 'T23:59:59'
      })
    }
  },
  watch: {
    date (newDate) {
      if (newDate) {
        this.loadTasks()
      }
    }
  },
  mounted () {
    this.loadTasks()
  },
  methods: {
    loadTasks () {
      const date = new Date(this.date)
      this.$store.dispatch('TASKS_REQUEST', date)
    },
    pad2 (n) {
      return (n < 10 ? '0' : '') + n
    },
    getDateString (date) {
      const month = this.pad2(date.getMonth() + 1)
      const day = this.pad2(date.getDate())
      const year = this.pad2(date.getFullYear())
      return year + '-' + month + '-' + day
    }
  }
}
</script>
