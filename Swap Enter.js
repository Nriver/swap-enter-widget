// Swap "enter" and "shift + enter" except in lists
// This plugin swaps the behavior of Enter and Shift+Enter keys in Trilium Notes,
// but preserves the normal behavior when editing lists (numbered, bulleted, to-do lists).

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

    /**
     * Checks if the current selection is inside a list item
     * @param {Object} editor - The CKEditor instance
     * @returns {Boolean} - True if the selection is in a list item
     */
    isInList(editor) {
        const selection = editor.model.document.selection;
        const position = selection.getFirstPosition();

        if (!position) {
            return false;
        }

        // Check the view for list elements
        const viewPosition = editor.editing.mapper.toViewPosition(position);
        let viewNode = viewPosition.parent;
        while (viewNode) {
            // Check for HTML list elements or classes
            if (viewNode.name === 'ul' || viewNode.name === 'ol' || viewNode.name === 'li') {
                return true;
            }
            if (viewNode.hasClass && (
                //viewNode.hasClass('list-item') ||
                viewNode.hasClass('todo-list') ||
                viewNode.hasClass('numbered-list') ||
                viewNode.hasClass('bulleted-list')
            )) {
                return true;
            }
            viewNode = viewNode.parent;
        }

        return false;
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
                // Check if we're in a list item
                const inList = this.isInList(editor);

                if (inList) {
                    // In lists, use the default behavior (don't swap)
                    return;
                }

                // For non-list content, swap Enter and Shift+Enter
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

