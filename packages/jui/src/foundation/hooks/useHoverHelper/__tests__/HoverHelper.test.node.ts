/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-28 16:04:16
 * Copyright © RingCentral. All rights reserved.
 */
import { HoverHelper } from '../HoverHelper';

function setup({ hovered = false }: any = {}) {
  const setHovered = jest.fn().mockName('setHovered');
  const helper = new HoverHelper({ setHovered, hovered });
  const currentTarget = {
    contains(_target: any) {
      return this === _target;
    },
  };
  return { helper, setHovered, currentTarget };
}

describe('HoverHelper', () => {
  describe('onMouseEnter()', () => {
    it('should set hovered true', () => {
      const { helper, setHovered, currentTarget } = setup();

      helper.TriggerProps.onMouseEnter({
        currentTarget,
        target: currentTarget,
        relatedTarget: {},
      } as any);

      expect(setHovered).toHaveBeenCalledWith(true);
    });

    it('should do nothing if both target and relatedTarget are not inside currentTarget', () => {
      const { helper, setHovered, currentTarget } = setup();

      helper.TriggerProps.onMouseEnter({
        currentTarget,
        target: {},
        relatedTarget: {},
      } as any);

      expect(setHovered).not.toHaveBeenCalled();
    });
  });

  describe('onMouseOver()', () => {
    it('should set hovered true', () => {
      const { helper, setHovered, currentTarget } = setup();

      helper.TriggerProps.onMouseOver({
        currentTarget,
        target: currentTarget,
        relatedTarget: {},
      } as any);

      expect(setHovered).toHaveBeenCalledWith(true);
    });

    it('should do nothing if it is already hovered', () => {
      const { helper, setHovered, currentTarget } = setup({ hovered: true });

      helper.TriggerProps.onMouseOver({
        currentTarget,
        target: currentTarget,
        relatedTarget: {},
      } as any);

      expect(setHovered).not.toHaveBeenCalled();
    });
  });

  describe('onMouseOut()', () => {
    it('should set hovered false when currentTarget not contains target/relatedTarget', () => {
      const { helper, setHovered, currentTarget } = setup({ hovered: true });

      helper.TriggerProps.onMouseOut({
        currentTarget,
        target: {},
        relatedTarget: {},
      } as any);

      expect(setHovered).toHaveBeenCalledWith(false);
    });

    it('should do nothing when currentTarget contains target/relatedTarget', () => {
      const { helper, setHovered, currentTarget } = setup({ hovered: true });

      helper.TriggerProps.onMouseOut({
        currentTarget,
        target: currentTarget,
        relatedTarget: {},
      } as any);

      expect(setHovered).not.toHaveBeenCalled();
    });
  });
});
