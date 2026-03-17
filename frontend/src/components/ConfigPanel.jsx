export default function ConfigPanel({ config, setConfig }) {
  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: parseFloat(value) })
  }

  return (
    <aside className="w-72 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full overflow-y-auto hidden md:block">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg">参数配置</h3>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Temperature: {config.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={config.temperature}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            值越大回复越随机，值越小越稳定
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Top P: {config.top_p}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.top_p}
            onChange={(e) => handleChange('top_p', e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            核采样参数，控制多样性
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            最大生成长度: {config.max_new_tokens}
          </label>
          <input
            type="range"
            min="128"
            max="4096"
            step="128"
            value={config.max_new_tokens}
            onChange={(e) => handleChange('max_new_tokens', e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            生成的最大token数量
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            调整这些参数可以改变模型输出的风格。一般来说:
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <li>• 创作: Temperature 0.8-1.2</li>
            <li>• 问答: Temperature 0.3-0.7</li>
            <li>• 代码: Temperature 0.1-0.3</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
