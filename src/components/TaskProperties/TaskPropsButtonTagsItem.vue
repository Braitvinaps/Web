<template>
  <ul>
    <li>
      <div class="list-tags-access">
        <span
          v-if="tag.children?.length"
          class="svg-control-tree"
          @click="onCollapseTag(tag.uid)"
        >
          <span v-if="isOpen(tag.uid)">
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.77011 6.87133C4.40803 7.4288 3.59197 7.42879 3.22989 6.87133L0.149702 2.12908C-0.247103 1.51816 0.191341 0.71057 0.919818 0.71057L7.08018 0.71057C7.80866 0.71057 8.2471 1.51816 7.8503 2.12908L4.77011 6.87133Z"
                fill="#222222"
              />
            </svg>
          </span>
          <span v-else>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.87133 3.22989C7.4288 3.59197 7.42879 4.40803 6.87133 4.77011L2.12908 7.8503C1.51816 8.2471 0.71057 7.80866 0.71057 7.08018V0.919817C0.71057 0.191341 1.51816 -0.247102 2.12908 0.149703L6.87133 3.22989Z"
                fill="black"
                fill-opacity="0.5"
              />
            </svg>
          </span>
        </span>
        <div
          class="flex w-full"
          @click="onCheckTag(tag.uid)"
        >
          <svg
            v-if="tag.back_color !== '#A998B6'"
            width="24"
            height="24"
            viewBox="0 0 88 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="flex-none"
          >
            <path
              d="M77.9021 0.800003H45.1156C44.4406 0.800003 43.7994 1.07006 43.3269 1.54265L3.52077 41.3417C-0.107182 44.9705 -0.107182 50.8779 3.52077 54.4899L33.5062 84.4826C35.2611 86.2379 37.5897 87.2 40.0871 87.2C42.5845 87.2 44.9131 86.2379 46.668 84.4826L86.4573 44.6836C86.9298 44.211 87.1998 43.5696 87.1998 42.8945V10.0999C87.1998 4.96894 83.0319 0.800003 77.9021 0.800003ZM79.7414 41.983L43.1413 78.5921C42.3989 79.3347 41.4033 79.7567 40.3402 79.7567C39.2771 79.7567 38.2816 79.3516 37.5391 78.6089L9.42673 50.4897C7.8743 48.9369 7.8743 46.422 9.42673 44.8692L46.0268 8.26021H75.776C77.9696 8.26021 79.7414 10.0493 79.7414 12.2266V41.983Z"
              :fill="tag.back_color"
              fill-opacity="1"
            />
            <path
              d="M61.788 19.8588C60.0885 19.8588 58.4969 20.5197 57.2965 21.7202C56.096 22.9206 55.4351 24.5123 55.4351 26.2118C55.4351 27.9113 56.096 29.5029 57.2965 30.7033C58.4969 31.9038 60.0885 32.5647 61.788 32.5647C63.4875 32.5647 65.0792 31.9038 66.2796 30.7033C67.4801 29.5029 68.141 27.9113 68.141 26.2118C68.141 24.5123 67.4801 22.9206 66.2796 21.7202C65.0792 20.5197 63.4875 19.8588 61.788 19.8588Z"
              :fill="tag.back_color"
              fill-opacity="1"
            />
          </svg>
          <svg
            v-else
            width="24"
            height="24"
            viewBox="0 0 88 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="flex-none"
          >
            <path
              d="M77.9021 0.800003H45.1156C44.4406 0.800003 43.7994 1.07006 43.3269 1.54265L3.52077 41.3417C-0.107182 44.9705 -0.107182 50.8779 3.52077 54.4899L33.5062 84.4826C35.2611 86.2379 37.5897 87.2 40.0871 87.2C42.5845 87.2 44.9131 86.2379 46.668 84.4826L86.4573 44.6836C86.9298 44.211 87.1998 43.5696 87.1998 42.8945V10.0999C87.1998 4.96894 83.0319 0.800003 77.9021 0.800003ZM79.7414 41.983L43.1413 78.5921C42.3989 79.3347 41.4033 79.7567 40.3402 79.7567C39.2771 79.7567 38.2816 79.3516 37.5391 78.6089L9.42673 50.4897C7.8743 48.9369 7.8743 46.422 9.42673 44.8692L46.0268 8.26021H75.776C77.9696 8.26021 79.7414 10.0493 79.7414 12.2266V41.983Z"
              fill="#6C6C6C"
              fill-opacity="1"
            />
            <path
              d="M61.788 19.8588C60.0885 19.8588 58.4969 20.5197 57.2965 21.7202C56.096 22.9206 55.4351 24.5123 55.4351 26.2118C55.4351 27.9113 56.096 29.5029 57.2965 30.7033C58.4969 31.9038 60.0885 32.5647 61.788 32.5647C63.4875 32.5647 65.0792 31.9038 66.2796 30.7033C67.4801 29.5029 68.141 27.9113 68.141 26.2118C68.141 24.5123 67.4801 22.9206 66.2796 21.7202C65.0792 20.5197 63.4875 19.8588 61.788 19.8588Z"
              fill="#6C6C6C"
              fill-opacity="1"
            />
          </svg>
          <input
            :id="`tag-check-button-${tag.uid}`"
            :checked="isCheckedTag(tag.uid)"
            type="checkbox"
            class="custom-checkbox-tags"
            @click="onCheckTag(tag.uid)"
          >
          <label
            class="w-full break-words cursor-pointer"
            :for="`tag-check-button-${tag.uid}`"
          >
            <span class="max-w-[160px] truncate ... mr-20px">
              {{ tag.name }}
            </span>
          </label>
        </div>
      </div>
      <template
        v-if="isOpen(tag.uid) && tag.children?.length"
      >
        <TaskPropsButtonTagsItem
          v-for="child in tag.children"
          :key="child.uid"
          class="pl-[30px]"
          :check-tags="checkTags"
          :collapsed-tags="collapsedTags"
          :tag="child"
          @collapseTag="onCollapseTag"
          @checkTag="onCheckTag"
        />
      </template>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TaskPropsButtonTagsItem', // necessary for self-reference
  props: {
    checkTags: {
      type: Array,
      default: () => []
    },
    collapsedTags: {
      type: Array,
      default: () => []
    },
    tag: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['checkTag', 'collapseTag'],
  methods: {
    isCheckedTag (tagUid) {
      const index = this.checkTags.findIndex(
        (uid) => uid === tagUid
      )
      return index !== -1
    },
    isOpen (tagUid) {
      const index = this.collapsedTags.findIndex(
        (uid) => uid === tagUid
      )
      return index === -1
    },
    onCheckTag (tagUid) {
      this.$emit('checkTag', tagUid)
    },
    onCollapseTag (tagUid) {
      this.$emit('collapseTag', tagUid)
    }
  }
}
</script>

<style scoped></style>
