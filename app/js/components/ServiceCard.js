export const ServiceCard = (service, settings) => {
    const target = settings.openNewTab ? '_blank' : '_self';
    return `
        <a href="${service.url}" class="service-card" target="${target}" rel="noopener noreferrer" data-id="${service.id}">
            <div class="card-glass"></div>
            <div class="card-content">
                <div class="icon">
                    <img src="${service.icon}" alt="${service.name}" loading="lazy" onerror="this.src='assets/default.png'">
                </div>
                <div class="info">
                    <div class="name">${service.name}</div>
                    ${service.description ? `<div class="desc">${service.description}</div>` : ''}
                </div>
            </div>
        </a>
    `;
};
