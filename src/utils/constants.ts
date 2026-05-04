const itDict = {
  title: 'Gestore di Compiti',
  subtitle: 'Gestisci i tuoi compiti in modo efficiente',
  todolist: {
    listitem: {
      title: 'Lista dei Compiti',
      edit: 'Modifica',
      delete: 'Elimina',
      detail: 'Dettaglio',
      createdAt: 'Creato il',
      updatedAt: 'Aggiornato il',
      completedAt: 'Completato il',
      dueDateAt: 'Scade il',
      expired: 'Scaduto',
      no_task: 'Nessun compito disponibile',
      show_descriptions: 'Mostra descrizioni',
      show_more: 'Mostra tutto',
      show_less: 'Mostra meno',
      priority: {
        label: 'Seleziona una priorità',
        items: {
          urgent: 'Urgente',
          high: 'Alta',
          medium: 'Media',
          low: 'Bassa',
        },
      },
      category: {
        label: 'Seleziona una categoria',
        items: {
          todo: 'Da fare',
          inProgress: 'In corso',
          done: 'Completato',
        },
      },
      filter: {
        label: 'Filtra per',
        all_kanban: 'Tutti (Kanban)',
        all: 'Tutti',
        completed: 'Completati',
        uncompleted: 'Non completati',
        overdue: 'Scaduti',
        not_overdue: 'Non scaduti',
        csv: {
          export: 'Esporta in CSV',
          import: 'Importa da CSV',
          success: 'Importazione completata con successo',
          error: "Errore durante l'importazione del file CSV",
          export_comments: 'Esporta commenti',
          import_comments: 'Importa commenti',
          success_comments: 'Importazione commenti completata con successo',
          error_comments: "Errore durante l'importazione dei commenti",
          section_tasks: 'Task',
          section_comments: 'Commenti',
        },
        buttons: {
          message: 'Che operazione vuoi fare?',
          description:
            'Queste operazioni sono irreversibili, procedi con cautela.',
          clear_completed: {
            label: 'Pulisci completati',
            message: 'Sei sicuro di voler eliminare i compiti completati?',
          },
          clear_expired: {
            label: 'Rimuovi compiti scaduti',
            message: 'Sei sicuro di voler eliminare i compiti scaduti?',
          },
          clear_all: {
            label: 'Rimuovi tutti i compiti',
            message: 'Sei sicuro di voler eliminare tutti i compiti?',
          },
          no_tasks: 'Non ci sono compiti da filtrare',
        },
      },
    },
    addTask: {
      hiddenForm: 'Nascondi il form',
      name: 'Titolo del compito',
      title: 'Aggiungi un compito',
      description:
        'Inserisci la descrizione del compito da completare. N.B.: puoi inserire Markdown per formattare il testo',
      label: 'Descrizione (Markdown)',
      confirm: "Confermi l'aggiunta del compito?",
      error: 'Il compito non può essere vuoto',
      placeholder: 'esempio "compra il latte"',
      submit: 'Aggiungi',
      cancel: 'Annulla',
      due_date: 'Data di scadenza',
    },
    editTask: {
      info: 'Modifica le informazioni del compito',
      title: 'Modifica Titolo',
      description: 'Vuoi salvare il compito selezionato?',
      submit: 'Salva',
      cancel: 'Annulla',
    },
    deleteTask: {
      title: 'Elimina compito',
      description: 'Sei sicuro di voler eliminare questo compito?',
      delete: 'Elimina',
      cancel: 'Annulla',
    },
    comments: {
      title: 'Commenti',
      placeholder:
        'Scrivi un commento… (Invio per inviare, Shift+Invio per andare a capo)',
      send: 'Invia',
      no_comments: 'Nessun commento ancora',
    },
  },
}

const enDict = {
  title: 'Task Manager',
  subtitle: 'Manage your tasks efficiently',
  todolist: {
    listitem: {
      title: 'Task List',
      edit: 'Edit',
      delete: 'Delete',
      detail: 'Detail',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      completedAt: 'Completed at',
      dueDateAt: 'Due date',
      expired: 'Overdue',
      no_task: 'No tasks available',
      show_descriptions: 'Show descriptions',
      show_more: 'Show more',
      show_less: 'Show less',
      priority: {
        label: 'Select a priority',
        items: {
          urgent: 'Urgent',
          high: 'High',
          medium: 'Medium',
          low: 'Low',
        },
      },
      category: {
        label: 'Select a category',
        items: {
          todo: 'To do',
          inProgress: 'In progress',
          done: 'Done',
        },
      },
      filter: {
        label: 'Filter by',
        all_kanban: 'All (Kanban)',
        all: 'All',
        completed: 'Completed',
        uncompleted: 'Uncompleted',
        overdue: 'Overdue',
        not_overdue: 'Not overdue',
        csv: {
          export: 'Export to CSV',
          import: 'Import from CSV',
          success: 'Import completed successfully',
          error: 'Error while importing the CSV file',
          export_comments: 'Export comments',
          import_comments: 'Import comments',
          success_comments: 'Comments import completed successfully',
          error_comments: 'Error while importing comments',
          section_tasks: 'Tasks',
          section_comments: 'Comments',
        },
        buttons: {
          message: 'What do you want to do?',
          description: 'These actions are irreversible, proceed with caution.',
          clear_completed: {
            label: 'Clear completed',
            message: 'Are you sure you want to delete completed tasks?',
          },
          clear_expired: {
            label: 'Remove overdue tasks',
            message: 'Are you sure you want to delete overdue tasks?',
          },
          clear_all: {
            label: 'Remove all tasks',
            message: 'Are you sure you want to delete all tasks?',
          },
          no_tasks: 'There are no tasks to filter',
        },
      },
    },
    addTask: {
      hiddenForm: 'Hide form',
      name: 'Task title',
      title: 'Add a task',
      description:
        'Enter the description of the task to complete. N.B.: you can use Markdown to format the text',
      label: 'Description (Markdown)',
      confirm: 'Confirm adding the task?',
      error: 'The task cannot be empty',
      placeholder: 'e.g. "buy milk"',
      submit: 'Add',
      cancel: 'Cancel',
      due_date: 'Due date',
    },
    editTask: {
      info: 'Edit task information',
      title: 'Edit Title',
      description: 'Do you want to save the selected task?',
      submit: 'Save',
      cancel: 'Cancel',
    },
    deleteTask: {
      title: 'Delete task',
      description: 'Are you sure you want to delete this task?',
      delete: 'Delete',
      cancel: 'Cancel',
    },
    comments: {
      title: 'Comments',
      placeholder: 'Write a comment… (Enter to send, Shift+Enter for new line)',
      send: 'Send',
      no_comments: 'No comments yet',
    },
  },
}

export type Language = 'it' | 'en'
export type Dict = typeof itDict

export const dicts: Record<Language, Dict> = { it: itDict, en: enDict }

export const dict = itDict
