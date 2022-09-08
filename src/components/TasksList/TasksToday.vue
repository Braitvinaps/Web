<template>
  <div class="w-full">
    <NavBarTasks
      id="NavBarToday"
      class="pt-[8px]"
      title="Сегодня"
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
  data () {
    return {
      date: new Date()
    }
  },
  computed: {
    newTaskProps () {
      return ({
        date_begin: this.getDateString(this.date) + 'T00:00:00',
        date_end: this.getDateString(this.date) + 'T23:59:59'
      })
    }
  },
  mounted () {
    this.$store.dispatch('TASKS_REQUEST', new Date(this.date))
  },
  methods: {
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
