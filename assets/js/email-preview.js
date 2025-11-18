// Funcionalidades para descarga y vista de código de emails
class EmailPreview {
    constructor() {
        this.init();
    }

    init() {
        this.setupDownloadButtons();
        this.setupCodeView();
        this.setupCopyButtons();
    }

    // Configurar botones de descarga
    setupDownloadButtons() {
        const downloadButtons = document.querySelectorAll('.download-html');
        downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadHTML(button.dataset.filename);
            });
        });
    }

    // Configurar vista de código
    setupCodeView() {
        const viewCodeButtons = document.querySelectorAll('.view-code');
        viewCodeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCodeView(button.dataset.target);
            });
        });
    }

    // Configurar botones de copiar código
    setupCopyButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-code')) {
                e.preventDefault();
                this.copyToClipboard(e.target.dataset.target);
            }
        });
    }

    // Descargar archivo HTML
    downloadHTML(filename) {
        try {
            // Obtener el contenido HTML del iframe o del código fuente
            const iframe = document.querySelector('.email-preview-frame iframe');
            let htmlContent;

            if (iframe && iframe.contentDocument) {
                htmlContent = iframe.contentDocument.documentElement.outerHTML;
            } else {
                // Fallback: obtener del pre element
                const codeElement = document.querySelector('.code-preview-content pre');
                if (codeElement) {
                    htmlContent = codeElement.textContent;
                } else {
                    throw new Error('No se pudo obtener el contenido HTML');
                }
            }

            // Crear blob y descargar
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'email-template.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification('✅ Archivo descargado correctamente');
        } catch (error) {
            console.error('Error al descargar:', error);
            this.showNotification('❌ Error al descargar el archivo', 'error');
        }
    }

    // Alternar vista de código
    toggleCodeView(targetId) {
        const codePreview = document.getElementById(targetId);
        if (!codePreview) return;

        const isVisible = codePreview.style.display === 'block';
        codePreview.style.display = isVisible ? 'none' : 'block';

        // Scroll suave a la sección de código
        if (!isVisible) {
            codePreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Copiar código al portapapeles
    copyToClipboard(targetId) {
        const codeElement = document.querySelector(`#${targetId} pre`);
        if (!codeElement) return;

        const textToCopy = codeElement.textContent;

        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showNotification('✅ Código copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
            this.showNotification('❌ Error al copiar el código', 'error');
        });
    }

    // Mostrar notificación
    showNotification(message, type = 'success') {
        // Remover notificación anterior si existe
        const existingNotification = document.querySelector('.download-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `download-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Cargar y mostrar código fuente (para usar en páginas específicas)
    loadEmailCode(emailPath, codeContainerId) {
        fetch(emailPath)
            .then(response => response.text())
            .then(html => {
                const codeContainer = document.getElementById(codeContainerId);
                if (codeContainer) {
                    const preElement = codeContainer.querySelector('pre');
                    if (preElement) {
                        preElement.textContent = this.formatHTML(html);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading email code:', error);
            });
    }

    // Formatear HTML para mejor visualización
    formatHTML(html) {
        // Limpiar y formatear ligeramente el HTML
        return html
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.emailPreview = new EmailPreview();
    
    // Cargar códigos automáticamente si existen en la página
    const codeContainers = document.querySelectorAll('[data-email-path]');
    codeContainers.forEach(container => {
        const emailPath = container.dataset.emailPath;
        const codeContainerId = container.id;
        window.emailPreview.loadEmailCode(emailPath, codeContainerId);
    });
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailPreview;
}
