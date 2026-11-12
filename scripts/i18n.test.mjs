import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import { createI18n } from 'vue-i18n'
const source = fs.readFileSync(new URL('../src/i18n/messages.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022 },
}).outputText
const { messages } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
)
test('Russian and English have the same translation keys, with valid interpolation', () => {
  assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages.ru).sort())
  const instance = createI18n({
    legacy: false,
    flatJson: true,
    locale: 'ru',
    fallbackLocale: 'en',
    messages: structuredClone(messages),
  })
  for (const locale of ['ru', 'en']) {
    instance.global.locale.value = locale
    for (const key of Object.keys(messages[locale])) {
      const translated = instance.global.t(key, { count: 6, done: 2, total: 4, course: 'Vue 3' })
      assert.notEqual(translated, key)
      assert.ok(!/\{(?:count|done|total|course)\}/.test(translated), key)
    }
  }
  assert.equal(instance.global.t('count.courses', { count: 1 }), '1 course')
  assert.equal(instance.global.t('count.courses', { count: 6 }), '6 courses')
  instance.global.locale.value = 'ru'
  assert.equal(
    instance.global.t('rec.collaborativeReason', { course: 'Vue 3' }),
    'Учащиеся курса Vue 3 также выбрали этот курс.',
  )
})
