import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useComponentGenerator } from './useComponentGenerator';

const mockComponent = (id: string, prompt: string) => ({
  id,
  prompt,
  code: `render(<div>${prompt}</div>);`,
  createdAt: new Date().toISOString(),
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useComponentGenerator - currentIndex', () => {
  it('초기 currentIndex는 0이다', () => {
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.currentIndex).toBe(0);
  });

  it('setCurrentIndex로 인덱스를 변경할 수 있다', () => {
    localStorage.setItem(
      'rcg_components',
      JSON.stringify([mockComponent('1', 'A'), mockComponent('2', 'B'), mockComponent('3', 'C')])
    );
    const { result } = renderHook(() => useComponentGenerator());

    act(() => {
      result.current.setCurrentIndex(2);
    });

    expect(result.current.currentIndex).toBe(2);
  });

  it('clearAll 호출 시 currentIndex가 0으로 초기화된다', () => {
    localStorage.setItem(
      'rcg_components',
      JSON.stringify([mockComponent('1', 'A'), mockComponent('2', 'B')])
    );
    const { result } = renderHook(() => useComponentGenerator());

    act(() => {
      result.current.setCurrentIndex(1);
    });
    act(() => {
      result.current.clearAll();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.components).toHaveLength(0);
  });

  describe('removeComponent - currentIndex 조정', () => {
    it('currentIndex 이후의 항목을 삭제해도 currentIndex가 변하지 않는다', () => {
      localStorage.setItem(
        'rcg_components',
        JSON.stringify([mockComponent('1', 'A'), mockComponent('2', 'B'), mockComponent('3', 'C')])
      );
      const { result } = renderHook(() => useComponentGenerator());

      act(() => result.current.setCurrentIndex(0));
      act(() => result.current.removeComponent('3'));

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.components).toHaveLength(2);
    });

    it('currentIndex 이전 항목을 삭제하면 currentIndex가 1 감소한다', () => {
      localStorage.setItem(
        'rcg_components',
        JSON.stringify([mockComponent('1', 'A'), mockComponent('2', 'B'), mockComponent('3', 'C')])
      );
      const { result } = renderHook(() => useComponentGenerator());

      act(() => result.current.setCurrentIndex(2));
      act(() => result.current.removeComponent('1'));

      expect(result.current.currentIndex).toBe(1);
    });

    it('현재 보고 있는 마지막 항목을 삭제하면 currentIndex가 마지막으로 조정된다', () => {
      localStorage.setItem(
        'rcg_components',
        JSON.stringify([mockComponent('1', 'A'), mockComponent('2', 'B')])
      );
      const { result } = renderHook(() => useComponentGenerator());

      act(() => result.current.setCurrentIndex(1));
      act(() => result.current.removeComponent('2'));

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.components).toHaveLength(1);
    });

    it('마지막 하나 남은 항목을 삭제하면 currentIndex가 0이 된다', () => {
      localStorage.setItem(
        'rcg_components',
        JSON.stringify([mockComponent('1', 'A')])
      );
      const { result } = renderHook(() => useComponentGenerator());

      act(() => result.current.removeComponent('1'));

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.components).toHaveLength(0);
    });
  });

  describe('generate - currentIndex 초기화', () => {
    it('generate 성공 시 currentIndex가 0으로 이동한다', async () => {
      localStorage.setItem(
        'rcg_components',
        JSON.stringify([mockComponent('1', 'A'), mockComponent('2', 'B')])
      );
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ code: 'render(<div />);' }),
      }));

      const { result } = renderHook(() => useComponentGenerator());

      act(() => result.current.setCurrentIndex(1));
      await act(async () => {
        await result.current.generate('새 컴포넌트', undefined, 'google');
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.components).toHaveLength(3);
    });

    it('generate 실패 시 currentIndex가 변하지 않는다', async () => {
      localStorage.setItem(
        'rcg_components',
        JSON.stringify([mockComponent('1', 'A'), mockComponent('2', 'B')])
      );
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'API 오류' }),
      }));

      const { result } = renderHook(() => useComponentGenerator());

      act(() => result.current.setCurrentIndex(1));
      await act(async () => {
        await result.current.generate('새 컴포넌트', undefined, 'google');
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.error).toBe('API 오류');
    });
  });
});
