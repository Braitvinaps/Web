<template>
  <!-- Confirm modal -->
  <ModalBoxDelete
    v-if="showConfirm"
    title="Удалить задачу"
    :text="modalBoxDeleteText"
    @cancel="showConfirm = false"
    @yes="removeTask(lastSelectedTaskUid)"
  />
  <TaskListModalBoxLicenseLimit
    v-if="showTasksLimit"
    @cancel="showTasksLimit = false"
    @ok="showTasksLimit = false"
  />
  <TaskListUnboardingCard
    v-if="displayModal"
    @ok="okToModal"
  />
  <div
    v-else
    class="lg:mr-0"
    :class="{'mr-96': isPropertiesMobileExpanded}"
  >
    <!-- Add task input -->
    <div
      v-if="!hideInput"
      class="fixed-create z-[2] flex bg-[#f4f5f7] px-[3px] pt-px relative lg:static top-0"
    >
      <div
        class="flex items-center bg-[#FAFAFB] border dark:bg-gray-700 rounded-[8px] w-full"
      >
        <div
          class="flex items-center pl-3"
          :class="{ 'bg-white p-3 rounded-l-lg cursor-pointer': Object.keys(copiedTasks).length }"
          @click="pasteCopiedTasks('00000000-0000-0000-0000-000000000000')"
        >
          <svg
            :class="{ 'mr-2': Object.keys(copiedTasks).length }"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.00011 2.3457V8.4034M8.00011 8.4034V14.4611M8.00011 8.4034H14.4617M8.00011 8.4034H1.53857"
              stroke="#7E7E80"
              stroke-width="1"
              stroke-linecap="round"
            />
          </svg>
          <div
            v-if="Object.keys(copiedTasks).length"
            class="flex items-center justify-center bg-rose-600 rounded-full w-6 h-6"
          >
            <p class="text-white text-sm font-bold">
              {{ Object.keys(copiedTasks).length }}
            </p>
          </div>
        </div>
        <TaskListEdit
          id="task"
          ref="root"
          v-model="createTaskText"
          bg-transperant
          class="w-full text-black"
          placeholder="Добавить задачу"
          @keyup.enter="createTask($event)"
        />
      </div>
    </div>
    <!-- Skeleton -->
    <TasksSkeleton
      v-if="status == 'loading'"
      class="px-[3px]"
    />
    <!-- vue3-treeview -->
    <div
      v-if="status == 'success' && Object.keys(storeTasks).length"
      class="overflow-y-auto pt-[4px] px-[3px] min-h-[600px] w-full"
    >
      <tree
        :nodes="storeTasks"
        :config="newConfig"
        class="w-full h-full"
        @nodeOpened="nodeExpanding"
        @nodeFocus="nodeSelected"
        @nodeDragend="nodeDragEnd"
      >
        <template #before-input="props">
          <div
            :id="props.node.info.uid"
            class="border wrapperChild border-gray-300 group shrink-0 w-full pl-[31px] pr-[6px] py-[11px] mb-[4px] min-h-[42px] font-roboto flex flex-col bg-white rounded-[8px] relative"
            :style="{ backgroundColor: getValidBackColor(colors[props.node.info?.uid_marker]?.back_color) }"
            :class="{ 'ring ring-orange-400': props.node.id === lastSelectedTaskUid}"
          >
            <!-- Debug info -->
            <!--
            <pre class="text-[10px] leading-none">{{ props.node.id }}</pre>
            <pre class="text-[10px] leading-none">{{ props.node.children }}</pre>
            <pre class="text-[10px] leading-none">{{ props.node.info.order_new }}</pre>
            -->
            <!-- Name, Status -->
            <div
              class="flex gap-[6px] items-center w-full"
            >
              <div class="flex-none h-[20px] w-[20px] leading-[20px]">
                <TaskStatus
                  :task="props.node.info"
                  @changeStatus="onChangeStatus($event, props.node.info)"
                />
              </div>

              <!-- Editable name -->
              <contenteditable
                v-model="props.node.info.name"
                tag="div"
                class="taskName p-0 ring-0 outline-none w-[calc(100%-26px)] overflow-x-clip break-words cursor-default text-[14px]"
                :contenteditable="props.node.info._isEditable"
                placeholder="Введите название задачи"
                :no-nl="true"
                :no-html="true"
                :class="{ 'uppercase': !props.node.info._isEditable && colors[props.node.info.uid_marker] && colors[props.node.info.uid_marker].uppercase, 'text-gray-500': props.node.info.status == 1 || props.node.info.status == 7, 'line-through': props.node.info.status == 1 || props.node.info.status == 7, 'font-extrabold': props.node.info.readed == 0 }"
                :style="{ color: getValidForeColor(colors[props.node.info.uid_marker]?.fore_color) }"
                @focusout="clearTaskFocus(props.node.info)"
                @keydown.enter="updateTask($event, props.node.info); props.node.info._isEditable = false;"
              />
            </div>
            <!-- Tags, Overdue, Customer, Performer -->
            <div
              v-if="props.node.info.uid_customer == '00000000-0000-0000-0000-000000000000' || props.node.info.email_performer || props.node.info.is_overdue || props.node.info.tags || props.node.info.uid_project == '00000000-0000-0000-0000-000000000000' || props.node.info.term_customer || props.node.info.checklist || props.node.info.has_files || props.node.info.has_msgs || props.node.info.comment || props.node.info.focus"
              class="flex flex-wrap gap-[4px] items-center mt-[6px]"
            >
              <!-- Focus -->
              <TaskListIconLabel
                v-if="props.node.info.focus"
                :icon-path="taskfocus.path"
                :icon-box="taskfocus.viewBox"
                icon-class="text-red-600"
                icon-height="15"
                class="h-[22px]"
              />
              <!-- Data -->
              <TaskListIconLabel
                v-if="props.node.info.term_user"
                :icon-path="clock.path"
                :icon-box="clock.viewBox"
                :text="props.node.info.term_user"
                icon-width="16"
                class="h-[22px]"
                icon-height="16"
              />
              <TaskListIconLabel
                v-if="props.node.info.type !== 1 && props.node.info.type !== 2 && props.node.info.term_customer"
                :icon-path="clock.path"
                :icon-box="clock.viewBox"
                :text="props.node.info.term_customer"
                icon-class="text-red-600"
                class="h-[22px]"
                icon-height="15"
              />
              <!-- Customer -->
              <TaskListTagLabel
                v-if="props.node.info.uid_customer != '00000000-0000-0000-0000-000000000000' && employees[props.node.info.uid_customer] && props.node.info.uid_customer != currentUserUid"
                :text="employees[props.node.info.uid_customer].name"
                :color-bg-class="{ 'border-red-500': currentUserEmail == props.node.info.email_performer, 'bg-gray-400': currentUserEmail != props.node.info.email_performer, 'bg-opacity-50': props.node.info.status == 1 || props.node.info.status == 7, 'bg-red-500': currentUserEmail == props.node.info.email_performer }"
                :icon-height="15"
                :image="employees[props.node.info.uid_customer] ? employees[props.node.info.uid_customer].fotolink : ''"
                class="h-[22px]"
              />
              <!-- Performer -->
              <TaskListTagLabel
                v-if="props.node.info.email_performer && employeesByEmail[props.node.info.email_performer] && currentUserEmail != props.node.info.email_performer && employees[props.node.info.uid_customer] && employees[props.node.info.uid_customer].email != props.node.info.email_performer"
                :text="employeesByEmail[props.node.info.email_performer].name"
                :icon-width="props.node.info.performerreaded ? performerRead.width : performerNotRead.width"
                :icon-height="props.node.info.performerreaded ? performerRead.height : performerNotRead.height"
                :icon-box="props.node.info.performerreaded ? performerRead.viewBox : performerNotRead.viewBox"
                :icon-path="props.node.info.performerreaded ? performerRead.path : performerNotRead.path"
                :image="employeesByEmail[props.node.info.email_performer] ? employeesByEmail[props.node.info.email_performer].fotolink : ''"
                :color-bg-class="{ 'bg-gray-400': currentUserEmail != props.node.info.email_performer, 'bg-green-500': currentUserUid == props.node.info.uid_customer, 'bg-opacity-50': props.node.info.status == 1 || props.node.info.status == 7 }"
                class="h-[22px]"
              />
              <!-- Overdue -->
              <TaskListTagLabel
                v-if="props.node.info.is_overdue"
                text="Просрочено"
                color-text-class="text-red-600"
                color-bg-class="bg-red-300 opacity-70"
                :icon-height="15"
                class="h-[22px]"
              />
              <!-- Tags -->
              <template
                v-for="(tag, index) in props.node.info.tags"
                :key="index"
              >
                <TaskListTagLabel
                  v-if="tags[tag]"
                  :icon-path="tagIcon.path"
                  :icon-box="tagIcon.viewBox"
                  :text="tags[tag].name"
                  :color-bg-style="{ backgroundColor: tags[tag] ? tags[tag].back_color : '' }"
                  class="h-[22px]"
                />
              </template>
              <!-- Project -->
              <TaskListTagLabel
                v-if="props.node.info.uid_project != '00000000-0000-0000-0000-000000000000' && projects[props.node.info.uid_project]"
                :icon-path="project.path"
                :icon-box="project.viewBox"
                :text="projects[props.node.info.uid_project].name"
                :color-bg-class="{ 'bg-yellow-400': true, 'bg-opacity-50': props.node.info.status == 1 || props.node.info.status == 7 }"
                class="h-[22px]"
              />
              <!-- Files -->
              <TaskListIconLabel
                v-if="props.node.info.has_files"
                :icon-path="file.path"
                :icon-box="file.viewBox"
                icon-width="11"
                icon-height="15"
                class="h-[22px]"
              />
              <!-- Checklist -->
              <TaskListIconLabel
                v-if="props.node.info.checklist"
                :icon-path="checklist.path"
                :icon-box="checklist.viewBox"
                :text="`${countChecklist(props.node.info.checklist).done} / ${countChecklist(props.node.info.checklist).undone}`"
                icon-height="15"
                icon-width="14"
                class="h-[22px]"
              />
              <!-- Access -->
              <TaskListIconLabel
                v-if="props.node.info.emails"
                :icon-path="inaccess.path"
                :icon-box="inaccess.viewBox"
                icon-width="15"
                icon-height="15"
                class="h-[22px]"
              />
              <!-- Messages -->
              <TaskListIconLabel
                v-if="props.node.info.has_msgs"
                :icon-path="msgs.path"
                :icon-box="msgs.viewBox"
                icon-height="15"
                class="h-[22px]"
                :icon-class="{ 'text-blue-600': props.node.info.is_inspectable }"
              />
              <!-- Comment -->
              <TaskListIconLabel
                v-if="props.node.info.comment.replace(/\r?\n|\r/g, '')"
                :icon-path="taskcomment.path"
                :icon-box="taskcomment.viewBox"
                icon-height="14"
                class="h-[22px]"
              />
            </div>
            <!-- canmove props.node.id === lastSelectedTaskUid -->
            <!-- props.node.info.uid_customer === user.current_user_uid && lastSelectedTaskUid === props.node.id -->
            <TaskListActionHoverPanel
              v-if="props.node.info.name"
              :id="`hover-panel-${props.node.id}`"
              class="absolute right-[8px] top-[calc(50%-18px)] invisible group-hover:visible"
              :is-my-task="props.node.info.uid_customer == currentUserUid"
              :can-paste="!!Object.keys(copiedTasks).length"
              :show-move-button="props.node.info.uid_customer === user.current_user_uid && lastSelectedTaskUid === props.node.id"
              @click.stop
              @addSubtask="addSubtask(props.node.info)"
              @changeFocus="changeFocus(props.node.info)"
              @openMenu="toggleTaskHoverPopper(true, props.node.id)"
              @closeMenu="toggleTaskHoverPopper(false, props.node.id)"
              @tomorrow="moveTaskTomorrow(props.node.info)"
              @copyName="copyTaskName(props.node.info)"
              @copy="copyTask(props.node.info)"
              @changeTaskPosition="changeTaskPosition"
              @paste="pasteCopiedTasks(props.node.id)"
              @delete="clickDeleteTask(props.node.info)"
            />
          </div>
        </template>
      </tree>
    </div>

    <EmptyTasksListPics
      v-if="!Object.keys(storeTasks).length && status === 'success' && $route.name === 'tasksToday'"
    />
  </div>
</template>

<script>
import { useStore } from 'vuex'
import treeview from 'vue3-treeview'
// import onBoarding from '@/components/onBoarding/onBoarding.vue'
import TaskStatus from '@/components/TasksList/TaskStatus.vue'
import EmptyTasksListPics from '@/components/TasksList/EmptyTasksListPics.vue'
import ModalBoxDelete from './Common/ModalBoxDelete.vue'
import contenteditable from 'vue-contenteditable'
import TaskListIconLabel from '@/components/TasksList/TaskListIconLabel.vue'
import TaskListTagLabel from '@/components/TasksList/TaskListTagLabel.vue'
import TaskListActionHoverPanel from '@/components/TasksList/TaskListActionHoverPanel.vue'
import TaskListModalBoxLicenseLimit from '@/components/TasksList/TaskListModalBoxLicenseLimit.vue'
import TaskListUnboardingCard from '@/components/TasksList/TaskListUnboardingCard.vue'
import TaskListEdit from '@/components/TasksList/TaskListEdit.vue'
import TasksSkeleton from '@/components/TasksList/TasksSkeleton.vue'
import { USER_VIEWED_MODAL } from '@/store/actions/onboarding.js'
import { uuidv4 } from '@/helpers/functions'
import { TASK_STATUS } from '@/constants'

import * as TASK from '@/store/actions/tasks'

/* Icons */
import file from '@/icons/file.js'
import inaccess from '@/icons/inaccess.js'
import msgs from '@/icons/msgs.js'
import taskcomment from '@/icons/taskcomment.js'
import checklist from '@/icons/checklist.js'
import project from '@/icons/project.js'
import tagIcon from '@/icons/tag.js'
import performerRead from '@/icons/performer-read.js'
import performerNotRead from '@/icons/performer-not-read.js'
import taskfocus from '@/icons/taskfocus.js'
import panelfocus from '@/icons/panelfocus.js'
import clock from '@/icons/clock.js'
import subtask from '@/icons/subtask.js'
import taskoptions from '@/icons/taskoptions.js'
import repeat from '@/icons/repeat.js'
import fortomorrow from '@/icons/for-tomorrow.js'
import copy from '@/icons/copy.js'
import cut from '@/icons/cut.js'
import bin from '@/icons/bin.js'
import linkify from 'vue-linkify'
/* /Icons */
export default {
  components: {
    tree: treeview,
    TaskListIconLabel,
    TaskListTagLabel,
    TaskListEdit,
    TasksSkeleton,
    ModalBoxDelete,
    EmptyTasksListPics,
    TaskStatus,
    contenteditable,
    TaskListActionHoverPanel,
    TaskListModalBoxLicenseLimit,
    TaskListUnboardingCard
  },
  directives: {
    linkify
  },
  props: {
    hideInput: {
      type: Boolean,
      default: false
    },
    newTaskProps: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['changeTaskStatus'],
  data () {
    return {
      createTaskText: '',
      lastSelectedTask: {},
      orderNewSubtask: 0,
      showConfirm: false,
      showTasksLimit: false,
      stop: true
    }
  },
  computed: {
    loadedTasks () {
      return this.$store.state.tasks.loadedTasks
    },
    showOnboarding () {
      return this.$store.state.onboarding.showOnboarding
    },
    employees () {
      return this.$store.state.employees.employees
    },
    employeesByEmail () {
      return this.$store.state.employees.employeesByEmail
    },
    currentUserEmail () {
      return this.$store.state.user.user?.current_user_email ?? ''
    },
    currentUserUid () {
      return this.$store.state.user.user?.current_user_uid ?? ''
    },
    tags () {
      return this.$store.state.tasks.tags
    },
    colors () {
      return this.$store.state.colors.colors
    },
    modalBoxDeleteText () {
      let text = 'Вы действительно хотите удалить задачу?'
      if (this.storeTasks[this.lastSelectedTaskUid]?.children.length > 0) {
        text = 'Вы действительно хотите удалить задачу с подзадачами в количестве: ' + this.storeTasks[this.lastSelectedTaskUid].children.length + '?'
      }
      return text
    },
    projects () {
      return this.$store.state.projects.projects
    },
    status () {
      return this.$store.state.tasks.status
    },
    user () {
      return this.$store.state.user.user
    },
    newConfig () {
      return this.$store.state.tasks.newConfig
    },
    storeTasks () {
      return this.$store.state.tasks.newtasks
    },
    settings () {
      return this.$store.state.navigator.navigator.settings
    },
    isPropertiesMobileExpanded () {
      return this.$store.state.isPropertiesMobileExpanded
    },
    copiedTasks () {
      return this.$store.state.tasks.copiedTasks
    },
    displayModal () {
      return !this.$store.state.onboarding.visitedModals?.includes('tasks') && this.$store.state.onboarding.showModals
    },
    lastSelectedTaskUid () {
      return this.$store.state.tasks.selectedTask?.uid || ''
    },
    // icons
    project () {
      return project
    },
    tagIcon () {
      return tagIcon
    },
    performerNotRead () {
      return performerNotRead
    },
    performerRead () {
      return performerRead
    },
    taskfocus () {
      return taskfocus
    },
    panelfocus () {
      return panelfocus
    },
    clock () {
      return clock
    },
    subtask () {
      return subtask
    },
    taskoptions () {
      return taskoptions
    },
    repeat () {
      return repeat
    },
    fortomorrow () {
      return fortomorrow
    },
    copy () {
      return copy
    },
    cut () {
      return cut
    },
    bin () {
      return bin
    },
    file () {
      return file
    },
    inaccess () {
      return inaccess
    },
    msgs () {
      return msgs
    },
    taskcomment () {
      return taskcomment
    },
    checklist () {
      return checklist
    }
  },
  watch: {
    draggables (newval, oldval) {
      const draggables = document.querySelectorAll('.draggable')
      draggables.forEach(node => {
        node.addEventListener('drag', e => {
          this.stop = true
          if (e.originalEvent.clientY < 300) {
            this.stop = false
            this.scroll(-1)
          }
          if (e.originalEvent.clientY > (window.innerHeight - 150)) {
            this.stop = false
            scroll(1)
          }
        })
        node.addEventListener('dragend', e => {
          this.stop = false
        })
      })
    },
    lastSelectedTask (newTask, prevTask) {
      if (newTask.uid !== prevTask.uid && prevTask.name === '') {
        this.removeTask(prevTask.uid)
      }
    }
  },
  mounted () {
    window.getSelection().removeAllRanges()
    // не удалять, без объявление сторы через useStore не работает закрытие на escape
    const store = useStore()
    document.addEventListener('keyup', function (evt) {
      if (evt.keyCode === 27) {
        store.dispatch('asidePropertiesToggle', false)
      }
    })
  },
  methods: {
    sortTaskChildren (task) {
      const sortedChildrens = []
      for (let i = 0; i < this.storeTasks[task].children.length; i++) {
        sortedChildrens.push(this.storeTasks[this.storeTasks[task].children[i]])
      }
      sortedChildrens.sort((a, b) => a.info.order_new - b.info.order_new)
      console.log(sortedChildrens, 'childs')
      console.log(this.$store.state.tasks.newtasks[task])
      this.$store.state.tasks.newtasks[task].children = []
      for (let i = 0; i < sortedChildrens.length; i++) {
        if (sortedChildrens[i]) {
          this.$store.state.tasks.newtasks[task].children.push(sortedChildrens[i].id)
        }
      }
    },
    changeTaskPosition (position) {
      const selectedTask = {} // выделенная задача
      const rootTask = {} // не выделенная задача
      if (this.lastSelectedTask.parent) {
        this.sortTaskChildren(this.lastSelectedTask.parent)
      }
      switch (position) {
        case 'up':
          if (this.newConfig.roots.includes(this.lastSelectedTaskUid)) {
            for (let i = 0; i < this.newConfig.roots.length; i++) {
              if ((this.newConfig.roots[i] === this.lastSelectedTaskUid) && (i !== 0)) {
                this.newConfig.roots[i] = this.newConfig.roots[i - 1]
                rootTask.uid = this.newConfig.roots[i]
                rootTask.parent = this.storeTasks[rootTask.uid].parent
                rootTask.order = this.storeTasks[this.lastSelectedTaskUid].info.order_new

                selectedTask.uid = this.lastSelectedTaskUid
                selectedTask.parent = this.storeTasks[this.lastSelectedTaskUid].parent
                selectedTask.order = this.storeTasks[rootTask.uid].info.order_new
                this.newConfig.roots[i - 1] = this.lastSelectedTaskUid
              }
            }
          } else {
            if (this.storeTasks[this.lastSelectedTaskUid].parent) {
              for (let i = 0; i < this.storeTasks[this.lastSelectedTask.uid_parent].children.length; i++) {
                if ((this.storeTasks[this.lastSelectedTask.uid_parent].children[i] === this.lastSelectedTaskUid) && (i !== 0)) {
                  this.storeTasks[this.lastSelectedTask.uid_parent].children[i] = this.storeTasks[this.lastSelectedTask.uid_parent].children[i - 1]
                  rootTask.uid = this.storeTasks[this.lastSelectedTask.uid_parent].children[i]
                  rootTask.parent = this.storeTasks[rootTask.uid].parent
                  rootTask.order = this.storeTasks[this.lastSelectedTaskUid].info.order_new

                  selectedTask.uid = this.lastSelectedTaskUid
                  selectedTask.parent = this.storeTasks[this.lastSelectedTaskUid].parent
                  selectedTask.order = this.storeTasks[rootTask.uid].info.order_new
                  this.storeTasks[this.lastSelectedTask.uid_parent].children[i - 1] = this.lastSelectedTaskUid
                }
              }
            }
          }
          break
        case 'down':
          if (this.newConfig.roots.includes(this.lastSelectedTaskUid)) {
            for (let i = this.newConfig.roots.length - 1; i >= 0; i--) {
              if ((this.newConfig.roots[i] === this.lastSelectedTaskUid) && (i !== this.newConfig.roots.length - 1)) {
                this.newConfig.roots[i] = this.newConfig.roots[i + 1]
                rootTask.uid = this.newConfig.roots[i]
                rootTask.parent = this.storeTasks[rootTask.uid].parent
                rootTask.order = this.storeTasks[this.lastSelectedTaskUid].info.order_new

                selectedTask.uid = this.lastSelectedTaskUid
                selectedTask.parent = this.storeTasks[this.lastSelectedTaskUid].parent
                selectedTask.order = this.storeTasks[rootTask.uid].info.order_new
                this.newConfig.roots[i + 1] = this.lastSelectedTaskUid
              }
            }
          } else {
            if (this.storeTasks[this.lastSelectedTaskUid].parent) {
              for (let i = this.storeTasks[this.lastSelectedTask.uid_parent].children.length - 1; i >= 0; i--) {
                if (this.storeTasks[this.lastSelectedTask.uid_parent].children[i] === this.lastSelectedTaskUid && (i !== this.storeTasks[this.lastSelectedTask.uid_parent].children.length - 1)) {
                  this.storeTasks[this.lastSelectedTask.uid_parent].children[i] = this.storeTasks[this.lastSelectedTask.uid_parent].children[i + 1]
                  rootTask.uid = this.storeTasks[this.lastSelectedTask.uid_parent].children[i]
                  rootTask.parent = this.storeTasks[rootTask.uid].parent
                  rootTask.order = this.storeTasks[this.lastSelectedTaskUid].info.order_new

                  selectedTask.uid = this.lastSelectedTaskUid
                  selectedTask.parent = this.storeTasks[this.lastSelectedTaskUid].parent
                  selectedTask.order = this.storeTasks[rootTask.uid].info.order_new
                  this.storeTasks[this.lastSelectedTask.uid_parent].children[i + 1] = this.lastSelectedTaskUid
                }
              }
            }
          }
          break
      }
      // если selectedTask не заполнился, значит задача не попадает под условия сортировки
      if (!Object.keys(selectedTask).length) {
        return
      }
      this.$store.state.tasks.newtasks[selectedTask.uid].info.order_new = selectedTask.order
      this.$store.state.tasks.newtasks[selectedTask.uid].parent = selectedTask.parent
      this.$store.state.tasks.newtasks[selectedTask.uid].info.uid_parent = selectedTask.parent ?? '00000000-0000-0000-0000-000000000000'

      this.$store.state.tasks.newtasks[rootTask.uid].info.order_new = rootTask.order
      this.$store.state.tasks.newtasks[rootTask.uid].parent = rootTask.parent
      this.$store.state.tasks.newtasks[rootTask.uid].info.uid_parent = rootTask.parent ?? '00000000-0000-0000-0000-000000000000'

      if (selectedTask.parent) {
        this.sortTaskChildren(selectedTask.parent)
      }

      // изменяем выбранную задачу
      this.$store.dispatch(TASK.CHANGE_TASK_PARENT_AND_ORDER, {
        uid: selectedTask.uid,
        parent: selectedTask.parent ?? '00000000-0000-0000-0000-000000000000',
        order: selectedTask.order
      }).then(() => {
        // изменяем невыбранную задачу
        this.$store.dispatch(TASK.CHANGE_TASK_PARENT_AND_ORDER, {
          uid: rootTask.uid,
          parent: rootTask.parent ?? '00000000-0000-0000-0000-000000000000',
          order: rootTask.order
        })
      })
    },
    scroll (step) {
      const scrollY = window.scrollTop()
      window.scrollTop(scrollY + step)
      if (!this.stop) {
        setTimeout(() => { scroll(step) }, 20)
      }
    },
    shouldShowOnboarding (val) {
      this.$store.state.user.showOnboarding = val
    },
    toggleTaskHoverPopper (visible, uid) {
      const el = document.getElementById(`hover-panel-${uid}`)
      if (el) el.style.visibility = visible ? 'visible' : null
    },
    editTaskName (uid) {
      this.storeTasks[uid].info._isEditable = this.user.current_user_uid === this.storeTasks[uid].info.uid_customer
      document.getElementById(uid).parentNode.draggable = false
      this.$nextTick(() => {
        const taskName = document.getElementById(uid).querySelector('.taskName')
        const range = document.createRange()
        const sel = document.getSelection()
        range.setStart(taskName, 0)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        taskName.focus({ preventScroll: false })
      })
    },
    nodeExpanding (arg) {
      if (this.loadedTasks[arg.id]) return
      this.$store.dispatch(TASK.SUBTASKS_REQUEST, arg.id)
        .then(() => {
          this.$store.commit(TASK.ADD_LOADED_TASK, arg.id)
          this.$store.commit(TASK.UPDATE_NEW_TASK_LIST, this.$store.state.tasks.subtasks.tasks)
          // remove fake-uid from children array if subtasks are loaded
          for (let i = 0; i < arg.children.length; i++) {
            if (arg.children[i] === 'fake-uid') {
              arg.children.splice(i, 1)
            }
          }
          for (const task of this.$store.state.tasks.subtasks.tasks) {
            if (!arg.children.includes(task.uid)) {
              arg.children.push(task.uid)
            }
          }
        })
    },
    returnFocus () {
      this.$nextTick(() => {
        document.getElementById(this.lastSelectedTaskUid).parentElement.focus({ preventScroll: false })
      })
    },
    countChecklist (checklist) {
      const data = { done: 0, undone: 0 }
      // нормализуем перенос сторки (разные на windows и на mac)
      const chlist = checklist.replaceAll('\r\n', '\n').replaceAll('\r', '\n').replaceAll('\n', '\r\n')
      for (const line of chlist.split('\r\n\r\n')) {
        data.undone++
        if (+line.split('\r\n')[0] === 1) {
          data.done++
        }
      }
      return data
    },
    pad2 (n) {
      return (n < 10 ? '0' : '') + n
    },
    getTodaysDate (val, isYearFirst = true) {
      if (val == null) {
        val = new Date()
      }
      if (typeof val === 'string') { // parse date from ISO 8601 string
        val = new Date(val)
      }
      const month = this.pad2(val.getMonth() + 1)
      const day = this.pad2(val.getDate())
      const year = this.pad2(val.getFullYear())
      if (isYearFirst) {
        return year + '-' + month + '-' + day
      } else {
        return day + '-' + month + '-' + year
      }
    },
    handleTaskSource (taskData, uidParent) {
      let data
      if (taskData) {
        taskData.uid = uuidv4()
        taskData.status = 0
        taskData.uid_parent = uidParent
        taskData.uid_customer = this.user.current_user_uid
        taskData.email_performer = ''
        taskData.tags = []
        taskData.uid_marker = ''
        taskData.has_files = false
        taskData.has_msgs = false
        taskData.type = 1
        taskData._addToList = true
        data = taskData
      } else {
        data = {
          uid: uuidv4(),
          uid_parent: uidParent,
          uid_customer: this.user.current_user_uid,
          uid_project: '00000000-0000-0000-0000-000000000000',
          status: 0,
          email_performer: '',
          type: 1,
          name: this.createTaskText,
          comment: '',
          _addToList: true
        }
      }
      return data
    },
    pasteCopiedTasks (uidParent) {
      if (!this.copiedTasks) {
        return
      }

      for (const uid in this.copiedTasks) {
        const data = this.handleTaskSource(this.copiedTasks[uid], uidParent)
        this.$store.dispatch(TASK.CREATE_TASK, data)
        // actually remove task from server if this task was with _deleteAfterPaste flag (cut task)
        if (this.copiedTasks[uid]._deleteAfterPaste && this.copiedTasks[uid]._originTaskUid) {
          this.$store.dispatch(TASK.REMOVE_TASK, this.copiedTasks[uid]._originTaskUid)
        }
      }
      this.$store.commit(TASK.RESET_COPY_TASK)
    },
    createTask (e) {
      const data = this.handleTaskSource()
      e.preventDefault()
      e.target.value = ''
      e.target.blur()
      e.target.focus()
      const title = data.name.trim()
      if (title) {
        Object.assign(data, this.newTaskProps)
        data.name = title
        this.$store.dispatch(TASK.CREATE_TASK, data)
          .then((resp) => {
          // выделяем добавленную задачу
          // и отображаем её свойства
            this.nodeSelected({ id: data.uid, info: resp.data })
            if (this.$route.name === 'tasksToday') {
              this.$store.commit('addDot', new Date(data.date_begin))
            }
            document.getElementById('task').firstElementChild.focus({ preventScroll: false })
            setTimeout(() => {
              document.getElementById(data.uid).parentNode.draggable = false
              this.gotoNode(data.uid)
            }, 200)
          })
          .catch((e) => {
            if (e.response?.data?.error === 'limit. invalid license.') {
              this.showTasksLimit = true
            }
          })
      }
      this.createTaskText = ''

      return false
    },
    updateTask (event, task) {
      if (task._isEditable) {
        task.enterPress = true
        task.name = task.name.replace(/\r?\n|\r/g, '')
        if (task.name.length > 0) {
          if (task._justCreated) {
            task._justCreated = false
            this.$store.dispatch(TASK.CREATE_TASK, task)
              .then((task) => {
                this.sortTaskChildren(task.uid_parent)
              })
              .catch((e) => {
                if (e.response?.data?.error === 'limit. invalid license.') {
                  this.showTasksLimit = true
                  this.$store.commit(TASK.REMOVE_TASK, task.uid)
                }
              })
          } else {
            this.$store.dispatch(TASK.CHANGE_TASK_NAME, { uid: task.uid, value: task.name })
          }
          task._isEditing = false
        } else if (task.name.length === 0) {
          if (task._justCreated) {
            if (this.isPropertiesMobileExpanded) {
              this.$store.dispatch('asidePropertiesToggle', false)
            }
            this.$store.commit(TASK.REMOVE_TASK, task.uid)
          } else {
            this.showConfirm = true
            // removeTask(task.uid)
          }
        }
        if (task.uid_customer === this.user.current_user_uid) {
          document.getElementById(task.uid).parentNode.draggable = true
        }
        this.$store.dispatch(TASK.SELECT_TASK, task)
        this.$nextTick(() => { document.getElementById(task.uid).parentNode.click() })
      }
    },
    clearTaskFocus (task) {
      if (task.name === '') {
        // this.removeTask(task.uid)
      } else if (task.name !== '' && !task.enterPress) {
        this.updateTask(event, task)
      }
      if (this.isPropertiesMobileExpanded) {
        this.$store.dispatch('asidePropertiesToggle', false)
      }
      task._isEditing = false
    },
    moveTaskTomorrow (task) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      this.$store.dispatch(
        TASK.CHANGE_TASK_DATE,
        {
          uid_task: task.uid,
          str_date_begin: this.getTodaysDate(tomorrow) + 'T00:00:00',
          str_date_end: this.getTodaysDate(tomorrow) + 'T23:59:59',
          reset: 0
        }
      ).then((resp) => {
        task.term_user = resp.term
        task.is_overdue = resp.is_overdue
        if (task.uid_parent && task.uid_parent === '00000000-0000-0000-0000-000000000000') {
          this.$store.commit(TASK.REMOVE_TASK, task.uid)
        }
      })
    },
    okToModal () {
      this.$store.commit(USER_VIEWED_MODAL, 'tasks')
    },
    copyTaskName (task) {
      navigator.clipboard.writeText(task.name)
    },
    removeTask (uid) {
      if (this.isPropertiesMobileExpanded) {
        this.$store.dispatch('asidePropertiesToggle', false)
      }
      this.$store.dispatch(TASK.REMOVE_TASK, uid)
        .then(() => {
          this.showConfirm = false
          this.$store.dispatch(TASK.DAYS_WITH_TASKS)
        })
    },
    gotoNode (uid) {
      document.getElementById(uid).parentElement.focus({ preventScroll: false })
      const taskName = document.getElementById(uid).querySelector('.taskName')
      const range = document.createRange()
      const sel = document.getSelection()
      taskName.focus({ preventScroll: false })
      range.setStart(taskName, 0)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      this.$store.commit(TASK.SELECT_TASK, uid)
    },
    addSubtask (parent) {
      this.orderNewSubtask = this.orderNewSubtask - 1
      const newSubtask = {
        date_create: new Date(),
        uid: uuidv4(),
        uid_customer: this.user.current_user_uid,
        email_performer: parent.uid_customer === this.user.current_user_uid ? parent.email_performer : '',
        name: '',
        emails: '',
        comment: '',
        tags: [],
        order_new: this.orderNewSubtask,
        uid_marker: '00000000-0000-0000-0000-000000000000',
        status: 0,
        uid_parent: parent.uid,
        uid_project: parent.uid_project !== '00000000-0000-0000-0000-000000000000' ? parent.uid_project : '00000000-0000-0000-0000-000000000000',
        type: 1,
        SeriesType: 0,
        _isEditing: true,
        _isEditable: true,
        _justCreated: true
      }
      this.$store.dispatch(TASK.ADD_SUBTASK, newSubtask)
        .then(() => {
          // Don't know the event when I can call edit just created subtask
          // If we don't wait, then we won't focus on just created subtask
          setTimeout(() => {
            document.getElementById(newSubtask.uid).parentNode.draggable = false
            this.gotoNode(newSubtask.uid)
          }, 200)
        })
      this.$store.dispatch(TASK.SELECT_TASK, newSubtask)
      this.lastSelectedTask = newSubtask
    },
    copyTask (task) {
      const copiedTask = { ...task }
      copiedTask._deleteAfterPaste = false
      this.$store.commit(TASK.COPY_TASK, copiedTask)
    },
    nodeSelected (arg) {
      if (arg.info.name === '') {
        this.editTaskName(arg.info.uid)
      }
      this.lastSelectedTask = arg.info
      if (!this.isPropertiesMobileExpanded && arg.info.name) {
        this.$store.dispatch('asidePropertiesToggle', true)
      }
      if (this.lastSelectedTaskUid !== arg.id || this.$store.state.propertiesState !== 'task') {
        this.$nextTick(() => {
          this.$store.commit('basic', { key: 'propertiesState', value: 'task' })
          this.$store.dispatch(TASK.SELECT_TASK, arg.info)
            .then(() => {
              setTimeout(() => {
                document.getElementById(arg.id).scrollIntoView({ block: 'nearest', behavior: 'smooth' })
              }, 300)
            })
        })
      }
    },
    changeOrder (pool, taskUid) {
      for (let i = 0; i < pool.length; i++) {
        if (pool[i] === taskUid) {
          if (i === 0 && this.storeTasks[taskUid]?.info) {
            if (this.storeTasks[pool[i + 1]]) {
              this.storeTasks[pool[i]].info.order_new = this.storeTasks[pool[i + 1]].info.order_new - 0.1
            } else {
              this.storeTasks[pool[i]].info.order_new = 1
            }
          } else if (i > 0 && i !== pool.length - 1 && this.storeTasks[pool[i + 1]]?.info) {
            this.storeTasks[pool[i]].info.order_new =
              (this.storeTasks[pool[i - 1]].info.order_new + this.storeTasks[pool[i + 1]].info.order_new) / 2
          } else if (i > 0 && i === pool.length - 1) {
            this.storeTasks[pool[i]].info.order_new = this.storeTasks[pool[i - 1]].info.order_new + 0.1
          }
        }
      }
    },
    nodeDragEnd (node) {
      // do nothing if there is no task
      if (!this.storeTasks[node.dragged.node.id]) {
        return
      }

      if (this.storeTasks[node.dragged.node.id].parent) {
        const parent = this.storeTasks[this.storeTasks[node.dragged.node.id].parent]
        if (parent?.children?.length >= 1) {
          this.changeOrder(parent.children, node.dragged.node.id)
        }
      } else {
        if (this.newConfig.roots.length >= 1) {
          this.changeOrder(this.newConfig.roots, node.dragged.node.id)
        }
      }

      let parentUid
      for (const elem in this.storeTasks) {
        if (this.storeTasks[elem].children.includes(node.dragged.node.id)) {
          parentUid = elem
        }
      }

      this.storeTasks[node.dragged.node.id].parent = parentUid ?? '00000000-0000-0000-0000-000000000000'
      this.storeTasks[node.dragged.node.id].info.uid_parent = parentUid ?? '00000000-0000-0000-0000-000000000000'
      this.$store.state.tasks.selectedTask = this.storeTasks[node.dragged.node.id].info
      this.$store.dispatch(
        TASK.CHANGE_TASK_PARENT_AND_ORDER,
        {
          uid: node.dragged.node.id,
          parent: parentUid ?? '00000000-0000-0000-0000-000000000000',
          order: node.dragged.node.info.order_new ?? 0
        }
      ).then(() => {
        this.$store.commit(TASK.REMOVE_TASK_FROM_LEAVES, parentUid)
      })
    },
    changeFocus (task) {
      const newFocus = task.focus === 1 ? 0 : 1
      this.$store.dispatch(TASK.CHANGE_TASK_FOCUS, { uid: task.uid, value: newFocus }).then(
        resp => {
          task.focus = newFocus
        })
    },
    getValidForeColor (foreColor) {
      if (foreColor && foreColor !== '#A998B6') return foreColor
      return ''
    },
    getValidBackColor (backColor) {
      if (backColor && backColor !== '#A998B6') return backColor
      return ''
    },
    clickDeleteTask (task) {
      this.$store.commit(TASK.SELECT_TASK, task)
      this.showConfirm = true
    },
    sortTasks (task, restoredTasksArray) {
      restoredTasksArray[task.id] = task
      if (task.state.opened) {
        task.children.forEach((item) => {
          const child = this.storeTasks[item]
          if (child?.children?.length !== 0) {
            this.sortTasks(child, restoredTasksArray)
          }
          restoredTasksArray[item] = this.storeTasks[item]
        })
      }
    },
    onChangeStatus (status, task) {
      console.log('onChangeStatus', status, task)
      this.$store.dispatch(TASK.CHANGE_TASK_STATUS, { uid: task.uid, value: status }).then(() => {
        if (!this.$store.state.navigator.navigator.settings.show_completed_tasks && [TASK_STATUS.TASK_COMPLETED, TASK_STATUS.TASK_READY, TASK_STATUS.TASK_CANCELLED, TASK_STATUS.TASK_REJECTED].includes(status)) {
          const prevTasksArray = JSON.parse(JSON.stringify(this.storeTasks))
          const restoredTasksArray = []
          Object.values(prevTasksArray).forEach((item) => {
            if (item.children.length !== 0) {
              this.sortTasks(item, restoredTasksArray)
            } else if (this.newConfig.roots.includes(item.id)) {
              restoredTasksArray[item.id] = item
            }
          })
          this.$store.commit(TASK.REMOVE_TASK, task.uid)
          this.$store.dispatch(TASK.DAYS_WITH_TASKS)
          this.$store.dispatch(TASK.SELECT_NEXT_TASK, { prevTaskUid: task.uid, tasks: restoredTasksArray }).then(data => {
            if (!data) {
              this.$store.dispatch('asidePropertiesToggle', false)
              return
            }
            // фокусим следующий итем и открываем его свойства
            document.getElementById(data.id).focus({ preventScroll: false })
          })
        } else {
          this.$emit('changeTaskStatus', status, task)
        }
      })
    }
  }
}
</script>

<style>
:root{
   --v-onboarding-overlay-z: 40;
   --v-onboarding-step-z: 40;
}
.tree-level {
  flex: 1;
  margin-left: 0 !important;
}
.tree {
  margin-left: 0;
}

.icon-wrapper {
  padding: 0;
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  align-items: start;
  justify-content: center;
  width: 35px;
  position: absolute;
  left: 0;
  cursor: pointer;
  z-index: 1;
  top: 18px;
}

.input-wrapper {
  margin-left: .75em
}

.icon-wrapper svg {
  height: 10px;
  width: 10px;
}

.node-wrapper {
  min-height: 32px;
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  margin-left: 0rem;
  word-wrap: break-word;
  font-size: 14px;
  outline: none
}

.node-wrapper.disabled .checkbox-wrapper.checked {
  background: rgba(0, 0, 0, .26)
}

.node-wrapper.disabled .checkbox-wrapper.indeterminate {
  background: rgba(0, 0, 0, .26)
}

.node-wrapper.disabled .checkbox-wrapper {
  border-color: #00000042
}

.node-wrapper.focused .wrapperChild {
  @apply ring ring-orange-500;
  opacity: 1;
}

.checkbox-wrapper, checked:after {
  transform: translate(.25em, .3365384615em) rotate(-45deg);
  width: .7em;
  height: .3em;
  border: .125em solid #fff;
  border-top-style: none;
  border-right-style: none
}

.checkbox-wrapper.indeterminate:after {
  transform: translate(.25em, .3365384615em) rotate(0);
  width: .7em;
  height: .3em;
  border: .125em solid #fff;
  border-top-style: none;
  border-right-style: none;
  border-left-style: none
}

.checkbox-wrapper:after {
  content: "";
  position: absolute;
  left: 0;
  top: 0
}

.node-over {
  border-top: solid 2px #5C6BC0
}

.node-in {
  background-color: #bdbdbd
}

.node-under {
  border-bottom: solid 2px #5C6BC0
}

.progress {
  position: relative;
  height: 4px;
  display: block;
  width: 100%;
  background-color: #aab6fe;
  border-radius: 2px;
  background-clip: padding-box;
  margin: 0.5rem 0 1rem 0;
  overflow: hidden;
}
.progress .indeterminate {
  background-color: #3f51b5;
}
.progress .indeterminate:before {
  content: "";
  position: absolute;
  background-color: inherit;
  top: 0;
  left: 0;
  bottom: 0;
  will-change: left, right;
  -webkit-animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395)
    infinite;
  animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}
.progress .indeterminate:after {
  content: "";
  position: absolute;
  background-color: inherit;
  top: 0;
  left: 0;
  bottom: 0;
  will-change: left, right;
  -webkit-animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1)
    infinite;
  animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1)
    infinite;
  -webkit-animation-delay: 1.15s;
  animation-delay: 1.15s;
}

@-webkit-keyframes indeterminate {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}
@keyframes indeterminate {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}
@-webkit-keyframes indeterminate-short {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
}
@keyframes indeterminate-short {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
}

.level-enter-active,
.level-leave-active {
  transition: opacity 0.2s ease;
}

.level-enter-from,
.level-leave-to {
  opacity: 0;
  transition: opacity 0.2s ease;
  transform: 0
}

.tree-node {
  @apply ring-0 border-0
}

.dark {
  --popper-theme-background-color: #333333;
  --popper-theme-background-color-hover: #333333;
  --popper-theme-text-color: white;
  --popper-theme-border-width: 0px;
  --popper-theme-border-radius: 0.75rem;
  --popper-theme-padding: 10px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
}

.light {
  --popper-theme-background-color: #ffffff;
  --popper-theme-background-color-hover: #ffffff;
  --popper-theme-text-color: #333333;
  --popper-theme-border-width: 1px;
  --popper-theme-border-style: solid;
  --popper-theme-border-color: #eeeeee;
  --popper-theme-border-radius: 0.75rem;
  --popper-theme-padding: 10px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
}

.fixed-create {
  position: sticky;
  top: 55px;
  background-color:#f4f5f7;
}

[contenteditable=true]:empty:before{
  content: attr(placeholder);
  pointer-events: none;
  display: block; /* For Firefox */
  color: gray
}
</style>
