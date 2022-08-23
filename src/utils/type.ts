import type { MaybeRef } from '@vueuse/core'

export type DynamicProps<T> = {
  [P in keyof T]: MaybeRef<T[P]>
}

export type requiredByKeys<T, K extends keyof T> = {
  [P in K]-?: T[P]
} & Omit<T, K>

export type Writable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type Mutable<T> = Writable<T>
