<template>
  <div
    class="w-full"
  >
    <NavBarProjects
      class="pt-[8px]"
      :project-uid="projectUid"
    />
    <div
      v-if="currentProject?.children?.length"
      class="grid gap-[8px] mb-[8px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    >
      <template
        v-for="project in currentProject?.children"
        :key="project.uid"
      >
        <router-link :to="'/project/' + project.uid">
          <ProjectBlocItem
            :project="project"
          />
        </router-link>
      </template>
    </div>
    <TasksListNew
      class="pt-[8px]"
      :new-task-props="newTaskProps"
    />
  </div>
</template>

<script>
import NavBarProjects from '@/components/Navbar/NavBarProjects.vue'
import ProjectBlocItem from '@/components/Projects/ProjectBlocItem.vue'
import TasksListNew from '@/components/TasksListNew.vue'
import * as TASK from '@/store/actions/tasks'

export default {
  components: {
    ProjectBlocItem,
    TasksListNew,
    NavBarProjects
  },
  computed: {
    projectUid () {
      return this.$route.params.project_id
    },
    currentProject () {
      return this.$store.state.projects.projects[this.projectUid]
    },
    newTaskProps () {
      if (this.currentProject?.uid) {
        return ({
          uid_project: this.currentProject.uid
        })
      }
      return ({})
    }
  },
  watch: {
    projectUid (newUid) {
      if (newUid) {
        this.loadProject()
      }
    }
  },
  mounted () {
    this.loadProject()
  },
  methods: {
    loadProject () {
      // если нет такого проекта у нас - перекидываем в корень проектов
      if (!Object.keys(this.$store.state.projects.projects).includes(this.$route.params.project_id)) {
        this.$router.push('/project')
        return
      }
      this.$store.dispatch(TASK.PROJECT_TASKS_REQUEST, this.currentProject.uid)
      this.$store.commit(TASK.CLEAN_UP_LOADED_TASKS)
    }
  }
}
</script>

<style scoped></style>
