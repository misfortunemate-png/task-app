// 設定画面 — localStorage保存の各設定 + デバッグパネル — spec-phase3.md §7
import { useState } from 'react'
import { CHARACTERS } from '../data/characters.js'
import { LINES, FACE_MAP } from '../data/lines.js'
import { pickLine } from '../data/lines.js'
import '../styles/SettingsScreen.css'

// 設定値を localStorage から読む（デフォルト付き）
const readSettings = () => ({
  defaultCharTab: localStorage.getItem('defaultCharTab') ?? 'all',
  nadeThreshold:  parseInt(localStorage.getItem('nadeThreshold') ?? '5', 10),
  debugMode:      localStorage.getItem('debugMode') === 'true',
})

// onSettingsChange: 設定変更時に App.jsx の再レンダリングを促すコールバック
export default function SettingsScreen({ onSettingsChange }) {
  const [settings, setSettings] = useState(readSettings)

  // デバッグパネルの状態
  const [debugCharId,   setDebugCharId]   = useState(CHARACTERS[0].id)
  const [debugEvent,    setDebugEvent]    = useState('register')
  const [debugCategory, setDebugCategory] = useState('generic')
  const [debugLine,     setDebugLine]     = useState(null)
  // キャラパラメータ一時変更
  const [paramOverrides, setParamOverrides] = useState({})

  const save = (key, value) => {
    localStorage.setItem(key, String(value))
    const next = { ...settings, [key]: value }
    setSettings(next)
    onSettingsChange?.(next)
  }

  // デバッグ: セリフ強制表示
  const handleDebugLine = () => {
    const line = pickLine(debugCharId, debugEvent, debugCategory)
    setDebugLine({ characterId: debugCharId, line })
  }

  // デバッグ: パラメータ一時変更
  const handleParamChange = (charId, paramKey, value) => {
    setParamOverrides((prev) => ({
      ...prev,
      [charId]: { ...(prev[charId] ?? {}), [paramKey]: parseFloat(value) },
    }))
  }

  return (
    <div className="settings-screen">
      <h2 className="settings-title">設定</h2>

      {/* 起動時のキャラタブ */}
      <section className="settings-section">
        <h3 className="settings-section-title">起動時のキャラタブ</h3>
        <select
          className="form-select"
          value={settings.defaultCharTab}
          onChange={(e) => save('defaultCharTab', e.target.value)}
        >
          <option value="all">全員</option>
          {CHARACTERS.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </section>

      {/* なでなで解除回数 */}
      <section className="settings-section">
        <h3 className="settings-section-title">なでなで解除回数</h3>
        <div className="settings-row">
          <input
            type="number"
            className="form-input settings-number"
            min={1}
            max={20}
            value={settings.nadeThreshold}
            onChange={(e) => save('nadeThreshold', parseInt(e.target.value, 10))}
          />
          <span className="settings-unit">回</span>
        </div>
      </section>

      {/* デバッグモード */}
      <section className="settings-section">
        <h3 className="settings-section-title">デバッグモード</h3>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={settings.debugMode}
            onChange={(e) => save('debugMode', e.target.checked)}
          />
          <span>{settings.debugMode ? 'ON' : 'OFF'}</span>
        </label>
      </section>

      {/* テーマ選択（枠のみ）*/}
      <section className="settings-section settings-section-disabled">
        <h3 className="settings-section-title">テーマ選択 <span className="settings-wip">Phase 4</span></h3>
        <p className="settings-muted">準備中</p>
      </section>

      {/* キャラパラメータ（読み取り専用）*/}
      <section className="settings-section">
        <h3 className="settings-section-title">キャラパラメータ</h3>
        {CHARACTERS.map((c) => (
          <details key={c.id} className="settings-params">
            <summary className="settings-params-summary">{c.emoji} {c.name}</summary>
            <table className="settings-params-table">
              <tbody>
                {Object.entries(c.params).map(([k, v]) => (
                  <tr key={k}>
                    <td className="param-key">{k}</td>
                    <td className="param-val">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="settings-muted" style={{ marginTop: 4, fontSize: '0.75rem' }}>{c.notes}</p>
          </details>
        ))}
      </section>

      {/* デバッグパネル */}
      {settings.debugMode && (
        <section className="settings-section debug-panel">
          <h3 className="settings-section-title">🐛 デバッグパネル</h3>

          {/* セリフ強制表示 */}
          <div className="debug-block">
            <p className="debug-label">セリフ強制表示</p>
            <div className="debug-row">
              <select className="form-select" value={debugCharId} onChange={(e) => setDebugCharId(e.target.value)}>
                {CHARACTERS.map((c) => <option key={c.id} value={c.id}>{c.emoji}{c.name}</option>)}
              </select>
              <select className="form-select" value={debugEvent} onChange={(e) => setDebugEvent(e.target.value)}>
                {['register','complete','neglect','cancel'].map((ev) => (
                  <option key={ev} value={ev}>{ev}</option>
                ))}
              </select>
              <select className="form-select" value={debugCategory} onChange={(e) => setDebugCategory(e.target.value)}>
                <option value="generic">generic</option>
              </select>
              <button className="btn-cancel" onClick={handleDebugLine}>表示</button>
            </div>
            {debugLine && (
              <div className="debug-line-preview">
                <span>{FACE_MAP[debugLine.line.face] ?? '😊'}</span>
                <p>{debugLine.line.text}</p>
              </div>
            )}
          </div>

          {/* セリフデータ一覧 */}
          <div className="debug-block">
            <p className="debug-label">セリフデータ一覧（{LINES.length}セット）</p>
            <div className="debug-lines-list">
              {LINES.map((l, i) => (
                <div key={i} className="debug-lines-item">
                  <span className="debug-lines-key">
                    {CHARACTERS.find((c)=>c.id===l.character)?.emoji} {l.character} / {l.event} / {l.category}
                  </span>
                  {l.lines.map((ln, j) => (
                    <p key={j} className="debug-lines-text">
                      {FACE_MAP[ln.face]} {ln.text}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* キャラパラメータ一時変更 */}
          <div className="debug-block">
            <p className="debug-label">キャラパラメータ一時変更（リロードでリセット）</p>
            {CHARACTERS.map((c) => (
              <details key={c.id} className="settings-params">
                <summary className="settings-params-summary">{c.emoji} {c.name}</summary>
                {Object.entries(c.params).map(([k, v]) => (
                  <div key={k} className="debug-param-row">
                    <span className="param-key">{k}</span>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input debug-param-input"
                      value={paramOverrides[c.id]?.[k] ?? v}
                      onChange={(e) => handleParamChange(c.id, k, e.target.value)}
                    />
                  </div>
                ))}
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
