// swap "enter" and "shift + enter"

class ChangeConfigWidget extends api.NoteContextAwareWidget {
    get parentWidget() { return "left-pane"; }
    
    doRender() {
        this.$widget = $("");
        this.editorIntervalId = null;
        this.initializedEditorIds = [];
    }

    refreshWithNote() {
        if (this.note.type === "text") {
            this.initializeEditor();
        }
    }
    
    initializeEditor() {
        this.editorIntervalId = setInterval(async () => {
            const editor = await api.getActiveContextTextEditor();
            clearInterval(this.editorIntervalId);
            if (!editor || this.initializedEditorIds.includes(editor.id)) {
                return;
            }
            this.initializedEditorIds.push(editor.id);
            editor.editing.view.document.on( 'enter', ( evt, data ) => {
                data.preventDefault();
                evt.stop();
                if ( data.isSoft ) {
                        editor.execute( 'enter' );
                        editor.editing.view.scrollToTheSelection();

                        return;
                }
                editor.execute( 'shiftEnter' );
                editor.editing.view.scrollToTheSelection();
            }, { priority: 'high' } );
        }, 1000);
    }
}

module.exports = new ChangeConfigWidget();

