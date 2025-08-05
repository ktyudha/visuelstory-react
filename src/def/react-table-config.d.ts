/* eslint-disable @typescript-eslint/no-unused-vars */
import { UsePaginationOptions, UseExpandedRowProps } from 'react-table';

declare module 'react-table' {
  // export interface TableOptions<D extends Record<string, unknown>>
  //   extends UsePaginationOptions<D>,
  //     Record<string, any> {}

  // export type TableState<
  //   D extends Record<string, unknwon> = Record<string, unknonw>
  // > = UsePaginationState<D>;

  // export type TableInstance<
  //   D extends Record<string, unknwon> = Record<string, unknonw>
  // > = UsePaginationInstanceProps<D>;

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Row<D extends object = {}> extends UseExpandedRowProps<D> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface TableOptions<D extends Record<string, unknown>>
    extends UseExpandedOptions<D> {}

  export interface UseTableColumnOptions<D extends object> {
    id?: IdType<D> | undefined;
    Header?: Renderer<HeaderProps<D>> | undefined;
    Footer?: Renderer<FooterProps<D>> | undefined;
    width?: number | string | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    textAlign?: 'text-center' | 'text-left' | 'text-right';
    orderableKey?: string;
    isSticky?: boolean;
    stickyPosition?: {
      left?: number;
      right?: number;
    };
  }
}
