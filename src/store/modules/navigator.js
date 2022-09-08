import axios from 'axios'
import store from '@/store/index'
import { PUSH_BOARD } from '../actions/boards'
import { PUSH_COLOR, PUSH_MYCOLOR } from '../actions/colors'
import { PUSH_DEPARTMENT } from '../actions/departments'
import { PUSH_EMPLOYEE, PUSH_EMPLOYEE_BY_EMAIL } from '../actions/employees'
import {
  NAVIGATOR_CHANGE_EMPLOYEE_DEPARTMENT,
  NAVIGATOR_ERROR,
  NAVIGATOR_PUSH_BOARD,
  NAVIGATOR_PUSH_COLOR,
  NAVIGATOR_PUSH_COMMON_BOARD,
  NAVIGATOR_PUSH_COMMON_PROJECT,
  NAVIGATOR_PUSH_DEPARTAMENT,
  NAVIGATOR_PUSH_EMPLOYEE,
  NAVIGATOR_PUSH_PROJECT,
  NAVIGATOR_PUSH_REGLAMENT,
  NAVIGATOR_PUSH_TAG,
  NAVIGATOR_REMOVE_BOARD,
  NAVIGATOR_REMOVE_COLOR,
  NAVIGATOR_REMOVE_DEPARTAMENT,
  NAVIGATOR_REMOVE_EMPLOYEE,
  NAVIGATOR_REMOVE_PROJECT,
  NAVIGATOR_REMOVE_REGLAMENT,
  NAVIGATOR_REMOVE_TAG,
  NAVIGATOR_REQUEST,
  NAVIGATOR_SUCCESS,
  NAVIGATOR_UPDATE_ASSIGNMENTS,
  NAVIGATOR_UPDATE_DEPARTMENT,
  NAVIGATOR_UPDATE_EMPLOYEE,
  NAVIGATOR_UPDATE_REGLAMENT,
  PATCH_SETTINGS,
  PATCH_SETTINGS_SUCCESS
} from '../actions/navigator'
import { PUSH_PROJECT } from '../actions/projects'
import { ADD_TASK_TAGS } from '../actions/tasks'
import { visitChildren } from '../helpers/functions'

const getDefaultState = () => {
  return {
    navigator: false,
    submenu: {
      status: false,
      activeTab: ''
    },
    status: '',
    computedNavigator: false,
    hasLoadedOnce: false,
    menu: []
  }
}

function getAllMembersByDepartmentUID (emps, departmentUID) {
  const employeesStuck = []
  for (const employee of emps) {
    if (employee.uid_dep === departmentUID) {
      employeesStuck.push(employee)
    }
  }
  return employeesStuck
}

const state = getDefaultState()

const getters = {
  getNavigator: (state) => state.navigator,
  navigatorStatus: (state) => state.status,
  sortedNavigator: (state) => {
    state.navigator?.new_private_boards[1]?.items.sort((board1, board2) => {
      return board1?.name.localeCompare(board2?.name)
    })
    state.navigator?.new_private_projects[1]?.items.sort(
      (project1, project2) => {
        return project1?.name.localeCompare(project2?.name)
      }
    )
    return state.navigator
  }
}

const actions = {
  [NAVIGATOR_REQUEST]: ({ commit, dispatch, rootState }) => {
    return new Promise((resolve, reject) => {
      commit(NAVIGATOR_REQUEST)
      const url = process.env.VUE_APP_LEADERTASK_API + 'api/v1/navigator/info'
      axios({ url: url, method: 'GET' })
        .then((resp) => {
          resp.rootState = rootState

          if (resp.data.delegate_iam) {
            for (const dm of resp.data.delegate_iam.items) {
              dm.parentID = resp.data.delegate_iam.uid
            }
          }
          if (resp.data.delegate_to_me) {
            for (const dt of resp.data.delegate_to_me.items) {
              dt.parentID = resp.data.delegate_to_me.uid
            }
          }
          if (resp.data.emps.items) {
            for (const employee of resp.data.emps.items) {
              employee.parentID = resp.data.emps.uid
              commit(PUSH_EMPLOYEE, employee)
              commit(PUSH_EMPLOYEE_BY_EMAIL, employee)
            }
          }
          commit(NAVIGATOR_SUCCESS, resp)
          // TODO: we are doing the same thing 3 times, DRY
          // process colors in shared vuex storage
          if (resp.data.colors.items) {
            commit(PUSH_COLOR, resp.data.colors.items)
            commit(PUSH_MYCOLOR, resp.data.colors.items)
            visitChildren(resp.data.colors.items, (value) => {
              value.parentID = resp.data.colors.uid
            })
          }
          // process private projects then put them in shared vuex storage
          if (resp.data.private_projects.items) {
            const myPrivateProjects = []
            visitChildren(resp.data.private_projects.items, (value) => {
              value.global_property_uid = resp.data.private_projects.uid
              myPrivateProjects.push(value)
            })
            commit(PUSH_PROJECT, myPrivateProjects)
          }
          // process shared projects then put them in shared vuex storage
          if (resp.data.common_projects.items) {
            const myCommonProjects = []
            visitChildren(resp.data.common_projects.items, (value) => {
              value.global_property_uid = resp.data.common_projects.uid
              myCommonProjects.push(value)
            })
            commit(PUSH_PROJECT, myCommonProjects)
          }

          if (resp.data.private_boards.items) {
            const myPrivateBoards = []
            visitChildren(resp.data.private_boards.items, (value) => {
              value.global_property_uid = resp.data.private_boards.uid
              myPrivateBoards.push(value)
            })
            commit(PUSH_BOARD, myPrivateBoards)
          }
          if (resp.data.common_projects.items) {
            const myCommonBoards = []
            visitChildren(resp.data.common_boards.items, (value) => {
              value.global_property_uid = resp.data.common_boards.uid
              myCommonBoards.push(value)
            })
            commit(PUSH_BOARD, myCommonBoards)
          }
          if (resp.data.deps.items) {
            for (const department of resp.data.deps.items) {
              commit(PUSH_DEPARTMENT, department)
            }
          }
          // process tags then put them in shared vuex storage
          if (resp.data.tags.items) {
            const myTags = []
            visitChildren(resp.data.tags.items, (value) => {
              // TODO: how to remove children without hurt actual data?
              value.global_property_uid = resp.data.tags.uid
              myTags.push(value)
            })
            commit(ADD_TASK_TAGS, myTags)
          }
          dispatch('setDots', resp.data.calendar.dates_with_tasks)
          resolve(resp)
        })
        .catch((err) => {
          commit(NAVIGATOR_ERROR, err)
          reject(err)
        })
    })
  },
  [PATCH_SETTINGS]: ({ commit, dispatch }, settings) => {
    return new Promise((resolve, reject) => {
      const url = process.env.VUE_APP_LEADERTASK_API + 'api/v1/settings/all'
      axios({ url: url, method: 'PATCH', data: settings })
        .then((resp) => {
          resolve(resp)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  [NAVIGATOR_UPDATE_EMPLOYEE]: ({ commit, dispatch }, employee) => {
    commit(NAVIGATOR_UPDATE_EMPLOYEE, employee)
    commit(PUSH_EMPLOYEE, employee)
    commit(PUSH_EMPLOYEE_BY_EMAIL, employee)
  },
  [NAVIGATOR_UPDATE_ASSIGNMENTS]: ({ commit }) => {
    return new Promise((resolve, reject) => {
      const url =
        process.env.VUE_APP_LEADERTASK_API + 'api/v1/navigator/assignments'
      axios({ url: url, method: 'GET' })
        .then((resp) => {
          if (resp.data.delegate_iam) {
            for (const dm of resp.data.delegate_iam.items) {
              dm.parentID = resp.data.delegate_iam.uid
            }
          }
          if (resp.data.delegate_to_me) {
            for (const dt of resp.data.delegate_to_me.items) {
              dt.parentID = resp.data.delegate_to_me.uid
            }
          }
          commit(NAVIGATOR_UPDATE_ASSIGNMENTS, resp)
          resolve(resp)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

const mutations = {
  [NAVIGATOR_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [NAVIGATOR_SUCCESS]: (state, resp) => {
    state.status = 'success'
    state.hasLoadedOnce = true
    console.log('navigator ', resp)
    state.menu = []

    // Если только переходим на другой таб (код выше), без запроса к серверу
    // используется в DoitnowEmpty.vue
    if (!resp) {
      return
    }

    const newAssignments = []
    newAssignments.push({
      dep: 'Поручено мной',
      items: resp.data.delegate_iam.items
    })
    newAssignments.push({
      dep: 'Поручено мне',
      items: resp.data.delegate_to_me.items
    })
    resp.data.new_delegate = newAssignments

    // Merge emps to deps like new private projects
    const dataEmps = [...resp.data.emps?.items]
    const newEmps = []
    newEmps.push({
      dep: { uid: '', name: 'Вне отдела' },
      items: getAllMembersByDepartmentUID(
        dataEmps,
        '00000000-0000-0000-0000-000000000000'
      )
    })
    for (const department of resp.data.deps.items) {
      const dep = {
        dep: department,
        items: getAllMembersByDepartmentUID(dataEmps, department.uid)
      }
      newEmps.push(dep)
    }
    resp.data.new_emps = newEmps

    // Merge common projects and private projects into my own data structure
    // Array of objects where object is { dep: 'Dependency name', items: items }
    const itemsInProjectView = []
    itemsInProjectView.push({
      dep: 'Мои проекты',
      items: resp.data.private_projects.items,
      type: 'projects'
    })
    itemsInProjectView.push({
      dep: 'Общие проекты',
      items: resp.data.common_projects.items,
      type: 'projects'
    })
    resp.data.new_private_projects = itemsInProjectView

    const newCommonBoards = []
    newCommonBoards.push({
      dep: 'Мои доски',
      items: resp.data.private_boards.items
    })
    newCommonBoards.push({
      dep: 'Общие доски',
      items: resp.data.common_boards.items
    })
    resp.data.new_private_boards = newCommonBoards
    state.navigator = resp.data
  },
  [NAVIGATOR_UPDATE_ASSIGNMENTS]: (state, resp) => {
    const newAssignments = []
    newAssignments.push({
      dep: 'Поручено мной',
      items: resp.data.delegate_iam.items
    })
    newAssignments.push({
      dep: 'Поручено мне',
      items: resp.data.delegate_to_me.items
    })
    state.navigator.delegate_iam = resp.data.delegate_iam
    state.navigator.delegate_to_me = resp.data.delegate_to_me
    state.navigator.new_delegate = newAssignments
  },
  [NAVIGATOR_PUSH_DEPARTAMENT]: (state, departaments) => {
    for (const departament of departaments) {
      if (
        departament.uid_parent ||
        departament.uid_parent === '00000000-0000-0000-0000-000000000000'
      ) {
        // adding departament to the root
        state.navigator.deps.items.push(departament)
      } else {
        // adding departament recursively to subarrays
        visitChildren(state.navigator.deps.items, (value) => {
          if (value.uid === departament.uid_parent) {
            value.children.push(departament)
          }
        })
      }
      // добавить в new_emps
      state.navigator.new_emps.push({
        dep: departament,
        items: getAllMembersByDepartmentUID(
          state.navigator.emps.items,
          departament.uid
        )
      })
    }
  },
  [NAVIGATOR_PUSH_REGLAMENT]: (state, reglament) => {
    state.navigator.reglaments.items.push(reglament)
  },
  [NAVIGATOR_REMOVE_REGLAMENT]: (state, reglament) => {
    // Проверка для правильной работы вебсинка, т.к он вместо объекта присылает только UID регламента
    const uid = typeof reglament === 'object' ? reglament.uid : reglament
    for (let i = 0; i < state.navigator.reglaments.items.length; i++) {
      if (state.navigator.reglaments.items[i].uid === uid) {
        state.navigator.reglaments.items.splice(i, 1)
        return
      }
    }
  },
  [NAVIGATOR_REMOVE_DEPARTAMENT]: (state, uidDepartment) => {
    // удаляем  из new_emps
    const indexEmps = state.navigator.new_emps.findIndex(
      (emps) => emps.dep.uid === uidDepartment
    )
    if (indexEmps !== -1) {
      const emps = state.navigator.new_emps[indexEmps]
      const rootEmps = state.navigator.new_emps.find(
        (emps) => emps.dep.uid === ''
      )
      if (rootEmps && emps) {
        rootEmps.items.push(...emps.items)
      }
      state.navigator.new_emps.splice(indexEmps, 1)
    }
    // удаляем из deps
    const indexDeps = state.navigator.deps.items.findIndex(
      (dep) => dep.uid === uidDepartment
    )
    if (indexDeps !== -1) state.navigator.deps.items.splice(indexDeps, 1)
  },
  [NAVIGATOR_UPDATE_DEPARTMENT]: (state, department) => {
    const indexEmps = state.navigator.new_emps.findIndex(
      (emps) => emps.dep.uid === department.uid
    )

    if (indexEmps !== -1) {
      // Очень проблемная задача. Единственное, с чем работаем это массив emails, и он может либо придти пустым, либо быть пустым в сторе
      let changedEmail
      for (let i = 0; i < state.navigator.new_emps[indexEmps].dep.emails.length; i++) {
        if (!department.emails.includes(state.navigator.new_emps[indexEmps].dep.emails[i])) {
          changedEmail = state.navigator.new_emps[indexEmps].dep.emails[i]
          break
        }
      }

      for (let i = 0; i < department.emails.length; i++) {
        if (!state.navigator.new_emps[indexEmps].dep.emails.includes(department.emails[i])) {
          changedEmail = department.emails[i]
          break
        }
      }

      if (changedEmail) {
        let changedEmployee, oldDepartmentUid
        for (let i = 0; i < state.navigator.new_emps.length; i++) {
          changedEmployee = state.navigator.new_emps[i].items.find(employee => employee.email === changedEmail)
          if (changedEmployee) {
            oldDepartmentUid = state.navigator.new_emps[i].dep.uid
            break
          }
        }

        // Т. к. при смене из отдела в отдел приходит 2 вебсинка, нужна проверка на emails. Если происходит смена из отдела во "Вне отдела", то придёт только один вебсинк
        // с пустым emails, и мы запишем его во "Вне отдела". При двух вебсинках сотрудник сначала запишется во "Вне отдела", а потом куда надо
        let uidDepartmentNew
        if (department.emails && department.emails.includes(changedEmployee.email)) {
          uidDepartmentNew = state.navigator.new_emps[indexEmps].dep.uid
        } else {
          uidDepartmentNew = '00000000-0000-0000-0000-000000000000'
        }

        store.commit(NAVIGATOR_CHANGE_EMPLOYEE_DEPARTMENT, {
          uidDepartmentOld: oldDepartmentUid,
          uidDepartmentNew: uidDepartmentNew,
          uidEmp: changedEmployee.uid
        })
      }

      state.navigator.new_emps[indexEmps].dep = department
    }

    const indexDeps = state.navigator.deps.items.findIndex(
      (dep) => dep.uid === department.uid
    )
    if (indexDeps !== -1) state.navigator.deps.items[indexDeps] = department
  },
  [NAVIGATOR_CHANGE_EMPLOYEE_DEPARTMENT]: (state, data) => {
    const uidDepOld =
      data.uidDepartmentOld === '00000000-0000-0000-0000-000000000000'
        ? ''
        : data.uidDepartmentOld
    const uidDepNew =
      data.uidDepartmentNew === '00000000-0000-0000-0000-000000000000'
        ? ''
        : data.uidDepartmentNew
    const indexEmpsOld = state.navigator.new_emps.findIndex(
      (emps) => emps.dep.uid === uidDepOld
    )
    const indexEmpsNew = state.navigator.new_emps.findIndex(
      (emps) => emps.dep.uid === uidDepNew
    )
    const empsOld = state.navigator.new_emps[indexEmpsOld]
    const empsNew = state.navigator.new_emps[indexEmpsNew]
    if (empsOld && empsNew && empsOld.dep.uid !== empsNew.dep.uid) {
      // отдел поменялся - перемещаем сотрудника
      const indexEmp = empsOld.items.findIndex((emp) => emp.uid === data.uidEmp)
      const [emp] = empsOld.items.splice(indexEmp, 1)
      empsNew.items.push(emp)
      emp.uid_dep = empsNew.dep.uid || '00000000-0000-0000-0000-000000000000'
    }
  },
  [NAVIGATOR_PUSH_PROJECT]: (state, projects) => {
    for (const project of projects) {
      if (
        !project.uid_parent ||
        project.uid_parent === '00000000-0000-0000-0000-000000000000'
      ) {
        // adding projects to the root
        state.navigator.new_private_projects[0].items.push(project)
      } else {
        // adding projects recursively to subarrays
        visitChildren(
          state.navigator.new_private_projects[0].items,
          (value) => {
            if (value.uid === project.uid_parent) {
              value.children.push(project)
            }
          }
        )
      }
    }
  },
  [NAVIGATOR_PUSH_COMMON_PROJECT]: (state, projects) => {
    for (const project of projects) {
      if (
        !project.uid_parent ||
        project.uid_parent === '00000000-0000-0000-0000-000000000000'
      ) {
        // adding projects to the root
        state.navigator.new_private_projects[1].items.push(project)
      } else {
        // adding projects recursively to subarrays
        visitChildren(
          state.navigator.new_private_projects[1].items,
          (value) => {
            if (value.uid === project.uid_parent) {
              value.children.push(project)
            }
          }
        )
      }
    }
  },
  [NAVIGATOR_PUSH_BOARD]: (state, boards) => {
    for (const board of boards) {
      if (
        !board.uid_parent ||
        board.uid_parent === '00000000-0000-0000-0000-000000000000'
      ) {
        // adding projects to the root
        state.navigator.new_private_boards[0].items.push(board)
      } else {
        // adding projects recursively to subarrays
        visitChildren(state.navigator.new_private_boards[0].items, (value) => {
          if (value.uid === board.uid_parent) {
            value.children.push(board)
          }
        })
      }
    }
  },
  [NAVIGATOR_PUSH_COMMON_BOARD]: (state, board) => {
    if (
      !board.uid_parent ||
        board.uid_parent === '00000000-0000-0000-0000-000000000000'
    ) {
      // adding projects to the root
      state.navigator.new_private_boards[1].items.push(board)
    } else {
      // adding projects recursively to subarrays
      visitChildren(state.navigator.new_private_boards[1].items, (value) => {
        if (value.uid === board.uid_parent) {
          value.children.push(board)
        }
      })
    }
  },
  [NAVIGATOR_PUSH_TAG]: (state, tags) => {
    for (const tag of tags) {
      if (
        !tag.uid_parent ||
        tag.uid_parent === '00000000-0000-0000-0000-000000000000'
      ) {
        // adding tags to the root
        state.navigator.tags.items.push(tag)
      } else {
        // adding projects recursively to subarrays
        visitChildren(state.navigator.tags.items, (value) => {
          if (value.uid === tag.uid_parent) {
            value.children.push(tag)
          }
        })
      }
    }
  },
  [NAVIGATOR_PUSH_COLOR]: (state, colors) => {
    for (const color of colors) {
      state.navigator.colors.items.push(color)
    }
  },
  NAVIGATOR_UPDATE_COLOR: (state, colors) => {
    visitChildren(state.navigator.colors.items, (value, index) => {
      if (value.uid === colors.uid) {
        Object.assign(value, colors)
      }
    })
  },
  [NAVIGATOR_UPDATE_REGLAMENT]: (state, reglament) => {
    for (let i = 0; i < state.navigator.reglaments.items.length; i++) {
      if (state.navigator.reglaments.items[i].uid === reglament.uid) {
        Object.assign(state.navigator.reglaments.items[i], reglament)
        return
      }
    }
  },
  NAVIGATOR_UPDATE_TAG: (state, tag) => {
    visitChildren(state.navigator.tags.items, (value) => {
      if (value.uid === tag.uid) {
        Object.assign(value, tag)
      }
    })
  },
  [NAVIGATOR_PUSH_EMPLOYEE]: (state, employees) => {
    for (const employee of employees) {
      state.navigator.emps.items.push(employee)
      const dep =
        employee.uid_dep === '00000000-0000-0000-0000-000000000000'
          ? ''
          : employee.uid_dep
      const emps = state.navigator.new_emps.find((emps) => emps.dep.uid === dep)
      emps?.items?.push(employee)
    }
  },
  [NAVIGATOR_REMOVE_PROJECT]: (state, project) => {
    if (
      !project.uid_parent ||
      project.uid_parent === '00000000-0000-0000-0000-000000000000'
    ) {
      for (
        let i = 0;
        i < state.navigator.new_private_projects[0].items.length;
        i++
      ) {
        if (
          state.navigator.new_private_projects[0].items[i].uid === project.uid
        ) {
          state.navigator.new_private_projects[0].items.splice(i, 1)
        }
      }
      for (
        let i = 0;
        i < state.navigator.new_private_projects[1].items.length;
        i++
      ) {
        if (
          state.navigator.new_private_projects[1].items[i].uid === project.uid
        ) {
          state.navigator.new_private_projects[1].items.splice(i, 1)
        }
      }
    } else {
      visitChildren(
        state.navigator.new_private_projects[0].items,
        (value, index) => {
          if (value.uid === project.uid_parent) {
            for (let i = 0; i < value.children.length; i++) {
              if (value.children[i].uid === project.uid) {
                // remove element without mutation
                value.children.splice(i, 1)
              }
            }
          }
        }
      )
    }
  },
  [NAVIGATOR_REMOVE_BOARD]: (state, board) => {
    if (
      !board.uid_parent ||
      board.uid_parent === '00000000-0000-0000-0000-000000000000'
    ) {
      for (
        let i = 0;
        i < state.navigator.new_private_boards[0].items.length;
        i++
      ) {
        if (state.navigator.new_private_boards[0].items[i].uid === board.uid) {
          state.navigator.new_private_boards[0].items.splice(i, 1)
        }
      }
      for (
        let i = 0;
        i < state.navigator.new_private_boards[1].items.length;
        i++
      ) {
        if (state.navigator.new_private_boards[1].items[i].uid === board.uid) {
          state.navigator.new_private_boards[1].items.splice(i, 1)
        }
      }
    } else {
      visitChildren(
        state.navigator.new_private_boards[0].items,
        (value, index) => {
          if (value.uid === board.uid_parent) {
            for (let i = 0; i < value.children.length; i++) {
              if (value.children[i].uid === board.uid) {
                // remove element without mutation
                value.children.splice(i, 1)
              }
            }
          }
        }
      )
    }
  },
  [NAVIGATOR_UPDATE_EMPLOYEE]: (state, employee) => {
    for (const dep of state.navigator.new_emps) {
      for (let i = 0; i < dep.items.length; i++) {
        if (dep.items[i].uid === employee.uid) {
          dep.items[i] = employee
        }
      }
    }
  },
  [NAVIGATOR_REMOVE_EMPLOYEE]: (state, employee) => {
    for (const dep of state.navigator.new_emps) {
      for (let i = 0; i < dep.items.length; i++) {
        if (dep.items[i].uid === employee.uid) {
          dep.items.splice(i, 1)
        }
      }
    }
  },
  [NAVIGATOR_REMOVE_TAG]: (state, tag) => {
    // removing wihtout mutation even on root level
    if (
      !tag.uid_parent ||
      tag.uid_parent === '00000000-0000-0000-0000-000000000000'
    ) {
      for (let i = 0; i < state.navigator.tags.items.length; i++) {
        if (state.navigator.tags.items[i].uid === tag.uid) {
          state.navigator.tags.items.splice(i, 1)
        }
      }
    } else {
      visitChildren(state.navigator.tags.items, (value, index) => {
        if (value.uid === tag.uid_parent) {
          for (let i = 0; i < value.children.length; i++) {
            if (value.children[i].uid === tag.uid) {
              // remove element without mutationy
              value.children.splice(i, 1)
            }
          }
        }
      })
    }
  },
  [NAVIGATOR_REMOVE_COLOR]: (state, color) => {
    for (let i = 0; i < state.navigator.colors.items.length; i++) {
      if (state.navigator.colors.items[i].uid === color.uid) {
        state.navigator.colors.items.splice(i, 1)
      }
    }
  },
  NAVIGATOR_UPDATE_PROJECT: (state, project) => {
    visitChildren(
      state.navigator.new_private_projects[0].items,
      (value, index) => {
        if (value.uid === project.uid) {
          Object.assign(value, project)
        }
      }
    )
  },
  [NAVIGATOR_ERROR]: (state) => {
    state.status = 'error'
    state.hasLoadedOnce = true
  },
  [PATCH_SETTINGS_SUCCESS]: (state, resp) => {
    state.navigator.settings = resp
  },
  initInviteMe (state, data) {
    if (!('invite_me' in state.navigator)) state.navigator.invite_me = {}

    state.navigator.invite_me.uid = data.uid
    state.navigator.invite_me.uid_owner_org = data.uid_org
    state.navigator.invite_me.name_owner_org = data.director_name
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
