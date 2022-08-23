import type { IAsyncRouteState } from '@/store/modules/asyncRoute'
import type { IUserState } from '@/store/modules/user'
import type { ITabsViewState } from '@/store/modules/tabsView'

export interface IStore {
  asyncRoute: IAsyncRouteState
  user: IUserState
  tabsView: ITabsViewState
  count: number
}
