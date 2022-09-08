<template>
  <div class="w-full">
    <NavBarTasks
      id="NavBarInFocus"
      class="pt-[8px]"
      title="Задачи в фокусе"
    />
    <TasksListNew :new-task-props="{ focus: 1 }" />
    <propertiesRight />
  </div>
</template>

<script>
import TasksListNew from '../TasksListNew.vue'
import PropertiesRight from '../PropertiesRight.vue'
import NavBarTasks from '@/components/Navbar/NavBarTasks.vue'

import * as TASK from '@/store/actions/tasks.js'

export default {
  components: {
    TasksListNew,
    PropertiesRight,
    NavBarTasks
  },
  data () {
    return {
      date: new Date(),
      uid: '6fc44cc6-9d45-4052-917e-25b1189ab141'
    }
  },
  mounted () {
    this.$store.dispatch(TASK.IN_FOCUS_TASKS_REQUEST)
  }
}

</script>
