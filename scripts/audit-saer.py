"""Run Saer's development components engine on this checkout, without changing source."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--engine', required=True, type=Path, help='Path to a Saer source checkout\'s packages/saer-cli/engine')
parser.add_argument('--output', type=Path, default=Path('.saer/components'))
args = parser.parse_args()
engine = args.engine.resolve()
if not (engine / 'components.py').is_file():
    parser.error('--engine must point to the Saer engine source directory')
sys.path.insert(0, str(engine))
import components
import components_report
import source_paths

root = Path(__file__).resolve().parents[1]
source_paths.activate(root)
try:
    result = components.analyse_repo(root, root)
finally:
    source_paths.deactivate()
result['auditContext'] = {'scope': 'Components development engine only', 'generatedAt': datetime.now(timezone.utc).isoformat(), 'engineRelease': 'local unreleased source'}
output = args.output.resolve()
output.mkdir(parents=True, exist_ok=True)
(output / 'components.json').write_text(json.dumps(result, indent=2) + '\n')
view = components_report.presentation_view(result)
(output / 'report.md').write_text('\n'.join(components_report.markdown_lines(view)) + '\n')
(output / 'report.html').write_text(components_report.html_section(view))
print(json.dumps({'status': result['status'], 'counts': result['counts'], 'libraries': result.get('libraries'), 'output': str(output)}, indent=2))
