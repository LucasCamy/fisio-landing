import '@fontsource-variable/bricolage-grotesque/index.css'
import '@fontsource-variable/manrope/index.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import './styles/globals.css'
import { applyAccent, initialAccent } from './lib/accent'

applyAccent(initialAccent(), false)
