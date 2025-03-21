export const dict = {
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
        buttons: {
          message: 'Che operazione vuoi fare?',
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
        },
      },
    },
    addTask: {
      hiddenForm: 'Nascondi il form',
      name: 'Titolo del compito',
      title: 'Aggiungi un compito',
      description: 'Inserisci la descrizione del compito da completare',
      label: 'Descrizione',
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
      description: 'Vuoi modificare il compito selezionato?',
      submit: 'Modifica',
      cancel: 'Annulla',
    },
    deleteTask: {
      title: 'Elimina compito',
      description: 'Sei sicuro di voler eliminare questo compito?',
      delete: 'Elimina',
      cancel: 'Annulla',
    },
  },
}
