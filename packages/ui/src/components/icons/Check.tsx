import { Path, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const [Check, AnimatedCheck] = createIcon({
  name: 'Check',
  getIcon: (props) => (
    <Svg viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M13.3334 4L6.00008 11.3333L2.66675 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
})
