<script setup lang="tsx">
import { PropType } from 'vue'
import { ElTag, ElProgress } from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'

interface AIAnalysisData {
  summary: string
  keywords: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
}

defineProps({
  data: {
    type: Object as PropType<AIAnalysisData>,
    required: true
  }
})
</script>

<template>
  <ContentWrap title="AI 评论分析">
    <div class="ai-analysis">
      <div class="summary">
        <h3>总体分析</h3>
        <p>{{ data.summary }}</p>
      </div>
      <div class="keywords">
        <h3>关键词</h3>
        <div class="keyword-tags">
          <ElTag v-for="keyword in data.keywords" :key="keyword" class="keyword-tag">
            {{ keyword }}
          </ElTag>
        </div>
      </div>
      <div class="sentiment">
        <h3>情感分布</h3>
        <div class="sentiment-bars">
          <div class="sentiment-item">
            <span>正面</span>
            <ElProgress :percentage="data.sentiment.positive" status="success" />
          </div>
          <div class="sentiment-item">
            <span>中性</span>
            <ElProgress :percentage="data.sentiment.neutral" status="warning" />
          </div>
          <div class="sentiment-item">
            <span>负面</span>
            <ElProgress :percentage="data.sentiment.negative" status="exception" />
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

  .keywords {
    margin-bottom: 20px;

    .keyword-tags {
      margin-top: 10px;

      .keyword-tag {
        margin-right: 10px;
        margin-bottom: 10px;
      }
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

        :deep(.el-progress) {
          flex: 1;
        }
      }
    }
  }
}
</style>
