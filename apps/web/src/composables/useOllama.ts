import { ref } from 'vue'

export interface OllamaConfig {
  baseUrl: string
  model: string
}

const defaultConfig: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  model: 'qwen3:4b-instruct',
}

const config = ref<OllamaConfig>({ ...defaultConfig })
const isAvailable = ref<boolean | null>(null)

export function useOllama() {
  const isLoading = ref(false)

  const checkAvailability = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${config.value.baseUrl}/api/tags`)
      isAvailable.value = response.ok
      return response.ok
    } catch {
      isAvailable.value = false
      return false
    }
  }

  const translate = async (
    text: string,
    targetLang: string = 'zh'
  ): Promise<string> => {
    isLoading.value = true
    try {
      // 使用 /no_think 禁用思考模式
      const prompt = `/no_think\n把下面的英文翻译成中文：${text}`

      const response = await fetch(`${config.value.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.value.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 300,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = (await response.json()) as { response: string }
      return data.response.trim()
    } catch (error) {
      console.error('Ollama translation error:', error)
      return ''
    } finally {
      isLoading.value = false
    }
  }

  const lookupWord = async (word: string, context?: string): Promise<string> => {
    isLoading.value = true
    try {
      // 使用 /no_think 禁用 qwen3 的思考模式，避免重复输出
      const prompt = context
        ? `/no_think\n用一句简洁的中文解释英文单词 "${word}" 在这个语境中的意思：${context.slice(0, 256)}`
        : `/no_think\n用一句简洁的中文解释英文单词 "${word}" 的意思`

      const response = await fetch(`${config.value.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.value.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.2,
            num_predict: 256,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = (await response.json()) as { response: string }
      return data.response.trim()
    } catch (error) {
      console.error('Ollama lookup error:', error)
      return ''
    } finally {
      isLoading.value = false
    }
  }

  const setConfig = (newConfig: Partial<OllamaConfig>) => {
    config.value = { ...config.value, ...newConfig }
    isAvailable.value = null
  }

  return {
    config,
    isAvailable,
    isLoading,
    checkAvailability,
    translate,
    lookupWord,
    setConfig,
  }
}
