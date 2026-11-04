"""The visual dependency updater must not overwrite framework or data ownership."""
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import pytest
ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'packages/terminal-ui'
spec=importlib.util.spec_from_file_location('terminal_ui_install',SOURCE/'install.py')
ui=importlib.util.module_from_spec(spec);spec.loader.exec_module(ui)

@pytest.fixture
def consumer(tmp_path):
    repo=tmp_path/'consumer';web=repo/'web';(web/'ui').mkdir(parents=True)
    (web/'index.html').write_text('<main>local app</main>')
    (web/'app.js').write_text('const PRIVATE_FRAMEWORK = true;')
    (web/'ui/dom.js').write_text('export function bindActions(root, actions){ return actions.localOnly(root); }\n')
    return repo

def test_install_preserves_local_callbacks_and_screen_changes(consumer):
    ui.install(consumer,SOURCE,None)
    actions=consumer/'web/ui/actions.js'
    assert 'actions.localOnly(root)' in actions.read_text()
    assert (consumer/'web/app.js').read_text()=='const PRIVATE_FRAMEWORK = true;'
    actions.write_text(actions.read_text()+'// local feature evolves independently\n')
    (consumer/'web/screens').mkdir();(consumer/'web/screens/9999-custom.js').write_text('export default {};')
    ui.check(consumer)
    ui.install(consumer,SOURCE,None)
    assert 'local feature evolves independently' in actions.read_text()
    assert (consumer/'web/screens/9999-custom.js').read_text()=='export default {};'

def test_modified_vendored_assets_are_not_silently_overwritten(consumer):
    ui.install(consumer,SOURCE,None)
    target=consumer/'web/shared/ui/tokens.css';target.write_text('/* consumer edit */')
    with pytest.raises(ValueError,match='drift'):ui.check(consumer)
    with pytest.raises(ValueError,match='drift'):ui.install(consumer,SOURCE,None)
    assert target.read_text()=='/* consumer edit */'

def test_bad_release_cannot_replace_application_code(consumer,tmp_path):
    source=tmp_path/'bad';shutil.copytree(SOURCE,source)
    bridges=json.loads((source/'bridges.json').read_text());bridges['app.js']={'kind':'js','source':'charts/model.js'}
    raw=(json.dumps(bridges)+'\n').encode();(source/'bridges.json').write_bytes(raw)
    manifest=json.loads((source/'manifest.json').read_text());manifest['files']['bridges.json']=hashlib.sha256(raw).hexdigest();(source/'manifest.json').write_text(json.dumps(manifest))
    with pytest.raises(ValueError,match='Unsupported UI compatibility'):ui.install(consumer,source,None)
    assert (consumer/'web/app.js').read_text()=='const PRIVATE_FRAMEWORK = true;'

def test_major_contract_change_requires_migration(consumer,tmp_path):
    source=tmp_path/'new-major';shutil.copytree(SOURCE,source)
    manifest=json.loads((source/'manifest.json').read_text());manifest['api_version']=2;(source/'manifest.json').write_text(json.dumps(manifest))
    with pytest.raises(ValueError,match='major version'):ui.install(consumer,source,None)

def test_no_moving_remote_refs_or_path_escape(tmp_path):
    with pytest.raises(ValueError,match='full 40-character'):ui.remote_package('work',tmp_path)
    with pytest.raises(ValueError,match='Unsafe bundle path'):ui.relative('../private-engine.py')
