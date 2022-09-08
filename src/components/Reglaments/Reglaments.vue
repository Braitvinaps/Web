<template>
  <div class="w-full pt-[30px]">
    <div
      v-if="!displayModal"
    >
      <ReglamentAddLimit
        v-if="showAddLimit"
        @cancel="showAddLimit = false"
        @ok="showAddLimit = false"
      />
      <div
        v-for="(reg, index) in reglaments"
        :key="index"
      >
        <div
          class="flex w-full"
          :class="{ 'justify-between': index == 0, 'mt-[28px]': index != 0 }"
        >
          <p class="font-['Roboto'] text-[#424242] text-[19px] leading-[22px] font-bold">
            {{ reg.dep }}
          </p>
          <div
            v-if="index == 0"
            class="flex"
          >
            <icon
              :path="listView.path"
              :width="listView.width"
              :height="listView.height"
              :box="listView.viewBox"
              class="cursor-pointer hover:text-gray-800 mr-2"
              :class="{
                'text-gray-800': !isGridView,
                'text-gray-400': isGridView
              }"
              @click="updateGridView(false)"
            />
            <icon
              :path="gridView.path"
              :width="gridView.width"
              :height="gridView.height"
              :box="gridView.viewBox"
              class="cursor-pointer hover:text-gray-800 mr-2"
              :class="{
                'text-gray-800': isGridView,
                'text-gray-400': !isGridView
              }"
              @click="updateGridView(true)"
            />
          </div>
        </div>
        <div
          class="grid gap-2 mt-3 grid-cols-1"
          :class="{
            'md:grid-cols-2 lg:grid-cols-4': isGridView,
            'lg:grid-cols-2': isPropertiesMobileExpanded && isGridView
          }"
        >
          <template
            v-for="reglament in reg.items"
            :key="reglament.uid"
          >
            <router-link
              :to="'/reglaments/' + reglament.uid"
            >
              <ReglamentBlocItem
                :reglament="reglament"
              />
            </router-link>
          </template>
          <ReglamentBlocEmpty
            v-if="!reg.is_my_dep && reg.items.length === 0"
          />
          <InputValue
            v-if="showAddReglament && addReglamentDepartment === reg.uid"
            @save="onAddNewReglament"
            @cancel="showAddReglament = false"
          />
          <ListBlocAdd
            v-else-if="reg.is_my_dep"
            title="Добавить регламент"
            @click.stop="clickAddReglament(reg.uid)"
          />
        </div>
      </div>
      <div
        v-if="currentUserIsAdmin"
        class="flex items-center w-full my-[28px] text-[#7e7e80] hover:text-[#424242] cursor-pointer"
        @click.stop="clickShowAll"
      >
        <p
          v-if="items.length"
          class="font-roboto text-[17px] leading-[22px]"
        >
          {{ showAllReglaments ? 'Показать только доступные' : 'Показать все регламенты' }}
        </p>
      </div>
    </div>
    <EmptyTasksListPics v-if="isEmpty" />
  </div>
  <div
    v-if="displayModal"
    class="flex flex-col justify-center items-center"
  >
    <img
      class="mx-auto mt-10"
      width="320"
      height="314"
      src="@/assets/images/regl.svg"
      alt="Empty task image"
    >
    <div class="w-[600px]">
      <p class="font-bold p-3 text-left">
        Автоматизируйте процесс внедрения новых сотрудников и аттестуйте текущих с помощью регламентов
      </p>
      <ul class="list-decimal pl-[30px]">
        <li class="p-3 text-sm">
          Запишите регламент и создайте тест, чтобы ваши сотрудники могли пройти его
        </li>
        <li class="p-3 text-sm">
          Общие регламенты - регламенты для всех сотрудников компании. Их должен знать каждый в компании
        </li>
        <li class="p-3 text-sm">
          Регламенты по отделам - доступны только сотрудникам отделов
        </li>
      </ul>
    </div>
    <button
      class="bg-[#FF912380] px-2 rounded-[8px] text-black text-sm mr-1 hover:bg-[#F5DEB3] w-[156px] h-[51px] mr-auto ml-auto mt-[20px]"
      @click="okToModal"
    >
      Понятно
    </button>
  </div>
</template>

<script>
import Icon from '@/components/Icon.vue'
import { setLocalStorageItem } from '@/store/helpers/functions'
import ReglamentBlocItem from '@/components/Reglaments/ReglamentBlockItem.vue'
import ReglamentBlocEmpty from '@/components/Reglaments/ReglamentBlocEmpty.vue'
import ListBlocAdd from '@/components/Common/ListBlocAdd.vue'
import ReglamentAddLimit from '@/components/Reglaments/ReglamentAddLimit.vue'
import EmptyTasksListPics from '@/components/TasksList/EmptyTasksListPics'

// import * as TASK from '@/store/actions/tasks'
import * as NAVIGATOR from '@/store/actions/navigator'
import * as REGLAMENTS from '@/store/actions/reglaments'
import * as SLIDES from '@/store/actions/slides.js'

import gridView from '@/icons/grid-view.js'
import listView from '@/icons/list-view.js'
import { USER_VIEWED_MODAL } from '@/store/actions/onboarding.js'
import { uuidv4 } from '@/helpers/functions'
import InputValue from '@/components/InputValue'

export default {
  components: {
    InputValue,
    Icon,
    ReglamentBlocItem,
    ReglamentBlocEmpty,
    ReglamentAddLimit,
    ListBlocAdd,
    EmptyTasksListPics
  },
  data () {
    return {
      showAddReglament: false,
      addReglamentDepartment: '',
      showAddLimit: false,
      gridView,
      listView
    }
  },
  computed: {
    items () {
      return this.$store.getters.sortedNavigator.reglaments?.items
    },
    isGridView () {
      setLocalStorageItem('isGridView', true)
      return this.$store.state.isGridView
    },
    isPropertiesMobileExpanded () {
      return this.$store.state.isPropertiesMobileExpanded
    },
    isEmpty () {
      return !this.items.length
    },
    user () {
      return this.$store.state.user.user
    },
    currentUserIsAdmin () {
      const employees = this.$store.state.employees.employees
      const userType = employees[this.user?.current_user_uid]?.type ?? 0
      return userType === 1 || userType === 2
    },
    allDepartments () {
      const deps = Object.values(this.$store.state.departments.deps)
      deps.sort((item1, item2) => {
        // сначала по порядку
        if (item1.order > item2.order) return 1
        if (item1.order < item2.order) return -1
        // если одинаковый, то по имени
        if (item1.name > item2.name) return 1
        if (item1.name < item2.name) return -1
        return 0
      })
      return deps
    },
    reglaments () {
      const reglaments = []
      /*
      const currentUserEmail = this.user.current_user_email.toLowerCase()
      const myItems = this.items.filter(reglament => reglament.email_creator.toLowerCase() === currentUserEmail)
      const otherItems = this.items.filter(reglament => reglament.email_creator.toLowerCase() !== currentUserEmail)
      reglaments.push({
        dep: 'Мои регламенты',
        items: myItems
      })
      if (otherItems.length) {
        reglaments.push({
          dep: 'Другие регламенты',
          items: otherItems
        })
      }
      return reglaments
      */
      const common = {
        dep: 'Общие регламенты',
        uid: '',
        is_my_dep: true,
        items: []
      }
      reglaments.push(common)
      const currentUserEmail = this.$store.state.user?.user?.current_user_email.toLowerCase()
      const departmentMap = {}
      for (const dep of this.allDepartments) {
        const reglament = {
          dep: dep.name.length > 50 ? dep.name.substring(0, 50) + '...' : dep.name,
          uid: dep.uid,
          is_my_dep: dep.emails.find(email => email.toLowerCase() === currentUserEmail),
          items: []
        }
        reglaments.push(reglament)
        departmentMap[reglament.uid] = reglament
      }
      for (const item of this.items) {
        const dep = departmentMap[item.department_uid]
        if (dep) {
          dep.items.push(item)
        } else {
          common.items.push(item)
        }
      }
      if (this.showAllReglaments) return reglaments
      return reglaments.filter(reg => reg.is_my_dep)
    },
    showAllReglaments () {
      return this.$store.state.reglaments.showAll
    },
    displayModal () {
      return !this.$store.state.onboarding.visitedModals?.includes('reglaments') && this.$store.state.onboarding.showModals
    }
  },
  created () {
    setLocalStorageItem('isGridView', true)
  },
  methods: {
    updateGridView (value) {
      this.$store.commit('basic', { key: 'isGridView', value: value })
      setLocalStorageItem('isGridView', value)
    },
    clickShowAll () {
      this.$store.state.reglaments.showAll = !this.showAllReglaments
    },
    clickAddReglament (uid) {
      if (this.user.tarif !== 'alpha' && this.user.tarif !== 'trial') {
        this.showAddLimit = true
        return
      }
      this.addReglamentDepartment = uid
      this.showAddReglament = true
    },
    onAddNewReglament (name) {
      const departmentUid = this.addReglamentDepartment
      this.addReglamentDepartment = ''
      this.showAddReglament = false
      const title = name.trim()
      if (title) {
        const reglament = {
          bold: 0,
          color: '',
          organization: this.user.owner_email,
          email_creator: this.user.current_user_email,
          name: title,
          content: '',
          department_uid: departmentUid,
          uid: uuidv4()
        }

        this.$store.dispatch(REGLAMENTS.CREATE_REGLAMENT_REQUEST, reglament).then(() => {
          reglament.needStartEdit = true
          this.$store.commit(SLIDES.CHANGE_VISIBLE, { name: 'addReglaments', visible: false })
          this.$store.commit(NAVIGATOR.NAVIGATOR_PUSH_REGLAMENT, reglament)
          this.$router.push('/reglaments/' + reglament.uid)
        })
      }
    },
    okToModal () {
      this.$store.commit(USER_VIEWED_MODAL, 'reglaments')
    }
  }
}
</script>

<style scoped></style>
