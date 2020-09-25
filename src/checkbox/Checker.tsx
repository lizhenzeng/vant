import { ref, computed, defineComponent } from 'vue';
import { addUnit } from '../utils';
import Icon from '../icon';

export const checkerProps = {
  name: null,
  disabled: Boolean,
  iconSize: [Number, String],
  modelValue: null,
  checkedColor: String,
  labelPosition: String,
  labelDisabled: Boolean,
  shape: {
    type: String,
    default: 'round',
  },
};

export default defineComponent({
  props: {
    ...checkerProps,
    role: String,
    parent: Object,
    checked: Boolean,
    bem: {
      type: Function,
      required: true,
    },
  },

  emits: ['click', 'toggle'],

  setup(props, { emit, slots }) {
    const iconRef = ref();

    const disabled = computed(
      () => (props.parent && props.parent.disabled) || props.disabled
    );

    const direction = computed(
      () => (props.parent && props.parent.direction) || null
    );

    const iconStyle = computed(() => {
      const checkedColor =
        props.checkedColor || (props.parent && props.parent.checkedColor);

      if (checkedColor && props.checked && !disabled.value) {
        return {
          borderColor: checkedColor,
          backgroundColor: checkedColor,
        };
      }
    });

    const onClick = (event: MouseEvent) => {
      const { target } = event;
      const icon = iconRef.value;
      const iconClicked = icon === target || icon.contains(target);

      if (!disabled.value && (iconClicked || !props.labelDisabled)) {
        emit('toggle');

        // wait for toggle method to complete
        // so we can get the changed value in the click event listener
        setTimeout(() => {
          emit('click', event);
        });
      } else {
        emit('click', event);
      }
    };

    const renderIcon = () => {
      const { bem, shape, parent, checked } = props;
      const iconSize = props.iconSize || (parent && parent.iconSize);

      return (
        <div
          ref={iconRef}
          class={bem('icon', [shape, { disabled: disabled.value, checked }])}
          style={{ fontSize: addUnit(iconSize) }}
        >
          {slots.icon ? (
            slots.icon({ checked })
          ) : (
            <Icon name="success" style={iconStyle.value} />
          )}
        </div>
      );
    };

    const renderLabel = () => {
      if (slots.default) {
        return (
          <span
            class={props.bem('label', [
              props.labelPosition,
              { disabled: disabled.value },
            ])}
          >
            {slots.default()}
          </span>
        );
      }
    };

    return () => {
      const nodes: (JSX.Element | undefined)[] = [renderIcon()];

      if (props.labelPosition === 'left') {
        nodes.unshift(renderLabel());
      } else {
        nodes.push(renderLabel());
      }

      return (
        <div
          role={props.role}
          class={props.bem([
            {
              disabled: disabled.value,
              'label-disabled': props.labelDisabled,
            },
            direction.value,
          ])}
          tabindex={disabled.value ? -1 : 0}
          aria-checked={props.checked}
          onClick={onClick}
        >
          {nodes}
        </div>
      );
    };
  },
});