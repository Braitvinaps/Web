<template>
  <div class="max-h-full h-full flex items-start overflow-y-hidden overflow-x-auto scroll-style animate-pulse flex pr-4 mt-0.5">
    <div :class="containerOuter">
      <hr :class="[headers, 'w-[150px]']">
      <hr :class="[lightText,'w-[100px]']">
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
    </div>
    <div :class="containerOuter">
      <div :class="[headers, 'w-[80px]']" />
      <div :class="[lightText,'w-[120px]']" />
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
    </div>
    <div :class="containerOuter">
      <div :class="[headers, 'w-[120px]']" />
      <div :class="[lightText,'w-[90px]']" />
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
    </div>
    <div :class="containerOuter">
      <div :class="[headers, 'w-[180px]']" />
      <div :class="[lightText,'w-[110px]']" />
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
    </div>
    <div :class="containerOuter">
      <div :class="[headers, 'w-[130px]']" />
      <div :class="[lightText,'w-[80px]']" />
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
    </div>
    <div :class="containerOuter">
      <div :class="[headers, 'w-[90px]']" />
      <div :class="[lightText,'w-[70px]']" />
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
    </div>
    <div :class="containerOuter">
      <div :class="[headers, 'w-[140px]']" />
      <div :class="[lightText,'w-[80px]']" />
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
    </div>
    <div :class="containerOuter">
      <div :class="[headers, 'w-[180px]']" />
      <div :class="[lightText,'w-[120px]']">
        <BoardSkeleton120 />
      </div>
      <div :class="[container, 'h-[240px]']">
        <BoardSkeleton240 />
      </div>
      <div :class="[container, 'h-[150px]']">
        <BoardSkeleton150 />
      </div>
      <div :class="[container, 'h-[120px]']">
        <BoardSkeleton120 />
      </div>
      <div :class="[container, 'h-[200px]']">
        <BoardSkeleton200 />
      </div>
    </div>
  </div>
</template>

<script>
import BoardSkeleton150 from '@/components/Board/BoardSkeleton150.vue'
import BoardSkeleton120 from '@/components/Board/BoardSkeleton120.vue'
import BoardSkeleton200 from '@/components/Board/BoardSkeleton200.vue'
import BoardSkeleton240 from '@/components/Board/BoardSkeleton240.vue'
export default {
  components: {
    BoardSkeleton150,
    BoardSkeleton120,
    BoardSkeleton200,
    BoardSkeleton240
  },
  data: () => ({
    container: 'animate-pulse bg-white rounded-[10px] border px-[18px] py-[20px] border-[#e5e5e5] mt-2',
    containerOuter: 'max-h-full flex-none bg-white rounded-xl px-3 py-4 w-[280px] mr-[10px] stage-column',
    headers: 'block h-[18px]  bg-neutral-300 mb-1.5 rounded-[10px]',
    lightText: 'block h-[8px] bg-neutral-200  mb-1.5 rounded-[10px]',
    userIcon: 'mr-2 w-[22px] h-[22px] rounded-[10px]'
  })
}
</script>
