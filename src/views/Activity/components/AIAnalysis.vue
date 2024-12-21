<script setup lang="tsx">
import { PropType } from 'vue'
import { ElTag, ElProgress } from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'

// 更新接口定义以匹配实际数据结构
interface AIAnalysisData {
  aiAnalysis?: string
  averageScore?: number
  goodNum?: number
  mediumNum?: number
  poorNum?: number
}

defineProps({
  data: {
    type: Object as PropType<AIAnalysisData>,
    required: true
  }
})

// 计算总评论数和百分比
const getTotalComments = (data: AIAnalysisData) => {
  return data.goodNum + data.mediumNum + data.poorNum
}

const getPercentage = (num: number, total: number) => {
  return total === 0 ? 0 : Math.round((num / total) * 100)
}
</script>

<template>
  <ContentWrap title="AI 评论分析">
    <div class="ai-analysis">
      <div class="summary">
        <h3>总体分析</h3>
        <p>{{ data.aiAnalysis }}</p>
      </div>
      <div class="score">
        <h3>平均评分</h3>
        <div class="score-value">{{ data.averageScore.toFixed(1) }}</div>
      </div>
      <div class="sentiment">
        <h3>评价分布</h3>
        <div class="sentiment-bars">
          <div class="sentiment-item">
            <span>好评</span>
            <ElProgress
              :percentage="getPercentage(data.goodNum, getTotalComments(data))"
              status="success"
            />
            <span class="count">({{ data.goodNum }})</span>
          </div>
          <div class="sentiment-item">
            <span>中评</span>
            <ElProgress
              :percentage="getPercentage(data.mediumNum, getTotalComments(data))"
              status="warning"
            />
            <span class="count">({{ data.mediumNum }})</span>
          </div>
          <div class="sentiment-item">
            <span>差评</span>
            <ElProgress
              :percentage="getPercentage(data.poorNum, getTotalComments(data))"
              status="exception"
            />
            <span class="count">({{ data.poorNum }})</span>
          </div>
        </div>
      </div>
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
.ai-analysis {
  padding: 20px;

  .summary {
    margin-bottom: 20px;
  }

  .score {
    margin-bottom: 20px;

    .score-value {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-top: 10px;
    }
  }

  .sentiment {
    .sentiment-bars {
      margin-top: 10px;

      .sentiment-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        span {
          width: 40px;
          margin-right: 10px;
        }

        .count {
          margin-left: 10px;
          color: #909399;
          width: auto;
        }

        :deep(.el-progress) {
          flex: 1;
        }
      }
    }
  }
}
</style>
