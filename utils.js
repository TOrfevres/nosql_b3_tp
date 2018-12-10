module.exports = {
    formatDate: (date, options = {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }) => (new Date(data.date)).toLocaleDateString("fr-FR", options)
};