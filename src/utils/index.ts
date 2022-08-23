import type { App, Plugin } from 'vue'
import { isObject } from './is/index'

export function withInstall(component: any, alias?: string) {
  component.install = (app: App) => {
    app.component(component.name, component)
    if (alias)
      app.config.globalProperties[alias] = component
  }
  return component as Plugin
}

export function deepAssign(source: Recordable = {}, target: Recordable = {}): Recordable {
  for (const key in target)
    source[key] = isObject(source[key]) ? deepAssign(source[key], target[key]) : (source[key] = target[key])

  return source
}

/**
 * Sums the passed percentage to the R, G or B of a HEX color
 * @param {string} color The color to change
 * @param {number} amount The amount to change the color by
 * @returns {string} The processed part of the color
 */
function addLight(color: string, amount: number): string {
  const cc = parseInt(color, 16) + amount
  const c = cc > 255 ? 255 : cc
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`
}

/**
 * Lightens a 6 char HEX color according to the passed percentage
 * @param {string} color The color to change
 * @param {number} amount The amount to change the color by
 * @returns {string} The processed color represented as HEX
 */
export function lighten(color: string, amount: number): string {
  color = color.includes('#') ? color.substring(1, color.length) : color
  amount = Math.trunc((255 * amount) / 100)
  return `#${addLight(color.substring(0, 2), amount)}${addLight(
    color.substring(2, 4),
    amount,
  )}${addLight(color.substring(4, 6), amount)}`
}
