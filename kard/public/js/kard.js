$.extend(frappe.desktop, {
    initializeGlobalSidebar: function() {
        function addButton() {
            var existingSpan = document.getElementById('globalmenu');

            if (!existingSpan) {
                var navbarBrand = document.querySelector('.navbar-brand.navbar-home');

                var globalMenuSpan = document.createElement('span');
                globalMenuSpan.id = 'globalmenu';
                globalMenuSpan.classList.add('icon-lg', 'navbar-icon'); // Add your icon styling class
                navbarBrand.parentNode.insertBefore(globalMenuSpan, navbarBrand);

                var svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                // svgIcon.setAttribute('class', 'icon icon-menu');
                svgIcon.setAttribute('viewBox', '0 0 24 24');

                var useElement = document.createElementNS("http://www.w3.org/2000/svg", "use");
                useElement.setAttribute('href', '#icon-menu');

                svgIcon.appendChild(useElement);
                globalMenuSpan.appendChild(svgIcon);

                globalMenuSpan.addEventListener('click', function() {
                    openSidebar();
                });
            }
        }

        function toggle_frappe_sidebar() {
            let wrapper = document.getElementById('page-Workspaces');
            let sidebar_wrapper = $(wrapper).find(".layout-side-section");

            if (frappe.utils.is_xs() || frappe.utils.is_sm()) {
                sidebar_wrapper.find(".close-sidebar").remove();
                let overlay_sidebar = sidebar_wrapper.find(".overlay-sidebar").addClass("opened");
                $('<div class="close-sidebar">').hide().appendTo(sidebar_wrapper).fadeIn(100, "linear");
                let scroll_container = $("html").css("overflow-y", "hidden");

                sidebar_wrapper.find(".close-sidebar").on("click", (e) => this.close_sidebar(e));
                sidebar_wrapper.on("click", "button:not(.dropdown-toggle)", (e) => this.close_sidebar(e));

                this.close_sidebar = () => {
                    scroll_container.css("overflow-y", "");
                    sidebar_wrapper.find("div.close-sidebar").fadeOut(100, "linear", () => {
                        overlay_sidebar
                            .removeClass("opened")
                            .find(".dropdown-toggle")
                            .removeClass("text-muted");
                    });
                };


            } else {
                sidebar_wrapper.toggle();
            }
            $(document.body).trigger("toggleSidebar");

            let sidebar_toggle = $(wrapper).find(".sidebar-toggle-btn");
            let sidebar_toggle_icon = sidebar_toggle.find(".sidebar-toggle-icon");
            let is_sidebar_visible = $(sidebar_wrapper).is(":visible");
            sidebar_toggle_icon.html(
                frappe.utils.icon(is_sidebar_visible ? "sidebar-collapse" : "sidebar-expand", "md")
            );

        }

        function openSidebar() {


            let route = frappe.get_route()
            if (!route) {
                return;
            }

            if (route[0] == "Workspaces") {
                toggle_frappe_sidebar();
                return;
            }

            let entries = frappe.boot.allowed_workspaces;
            let sidebar = document.getElementById('global-sidebar');
            let overlay = document.querySelector('.workspace-overlay');

            if (!sidebar) {
                sidebar = document.createElement('div');
                sidebar.id = 'global-sidebar';

                const sidebarContent = document.createElement('div');
                sidebarContent.id = 'content';
                sidebarContent.innerHTML = `
						<ul id="global-sidebarList"></ul>
					  `;

                sidebar.appendChild(sidebarContent);

                document.body.insertBefore(sidebar, document.querySelector('.main-section'));


            }


            const sidebarList = sidebar.querySelector('#global-sidebarList');
            sidebarList.innerHTML = ''; // Clear previous list items

            // Loop through the dictionary and create <li> elements
            for (var key in entries) {
                if (entries.hasOwnProperty(key)) {
                    if (entries[key].is_hidden != 1) {
                        let liElement = document.createElement('li');
                        // Create the <span> element
                        let spanElement = document.createElement('span');
                        spanElement.className = 'sidebar-item-icon'; // Add the class here

                        let iconVariable = 'icon-' + (entries[key].icon || 'folder-normal'); // Replace with your actual variable

                        // Set the inner HTML of the <span> element
                        spanElement.innerHTML = `
									<svg class="icon icon-lg">
										<use class="" href="#${iconVariable}"></use>
									</svg>
								`;

                        let name = entries[key].name.replace(/\s+/g, '-').toLowerCase();


                        let aElement = document.createElement('a');
                        aElement.href = '/app/' + name; // Generate href using the key

                        // Append the <span> to the <a>
                        aElement.appendChild(spanElement);

                        spanElement = document.createElement('span');
                        spanElement.className = 'sidebar-item-label'; // Add the class here
                        spanElement.textContent = entries[key].title;

                        aElement.appendChild(spanElement);
                        liElement.appendChild(aElement);
                        sidebarList.appendChild(liElement);
                    }

                }
            }



            sidebar.classList.toggle('opened');

            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'workspace-overlay';
                document.body.appendChild(overlay);

                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('opened');
                    overlay.style.display = 'none';
                });
            }

            overlay.style.display = 'block';
        }

        function closeSidebar() {
            var sidebar = document.getElementById('global-sidebar');
            var overlay = document.querySelector('.workspace-overlay');
            if (sidebar) {
                sidebar.classList.remove('opened');
            }
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
        addButton();

        // Event delegation for closing sidebar when any link is clicked
        document.body.addEventListener('click', function(event) {
            var sidebar = document.getElementById('global-sidebar');
            var overlay = document.querySelector('.workspace-overlay');
            if (sidebar && event.target.closest('#global-sidebar')) {
                closeSidebar();
            }
            if (overlay && event.target.closest('.workspace-overlay')) {
                closeSidebar();
            }
        });
    },
    get_workspace_data: function() {

        let route = frappe.get_route()
        if (!route) {
            return;
        }

        if (route[0] == "Workspaces" && route[1]) {
            if (!frappe.desktop.current_workspace || frappe.desktop.current_workspace != route[1]) {
                let workspace = frappe.desktop.current_workspace = route[1];
                let module = route[1];

                var matchingItem = frappe.boot.allowed_workspaces.find(item => item.name === route[1]);

                if (matchingItem) {
                    let new_module = matchingItem.module;
                    if (new_module) {
                        module = new_module;
                    }
                }
                ``
                var docs = [];
                var reports = [];
                frappe.call({
                    method: "kard_theme.kard_theme.doctype.kard_theme_settings.kard_theme_settings.get",
                    args: {
                        module: module,
                        workspace: workspace,
                    },
                    callback: function(response) {
                        var data = response.message.data;
                        data.every(m => {
                            if (m.label != "Reports") {
                                docs = docs.concat(m.items);
                            } else if (m.label == "Reports") {
                                reports = m.items;
                            }

                            return true;
                        });

                        // Custom sorting function
                        docs.sort(function(a, b) {
                            // Compare 'favorite' values (1 comes before 0)
                            if (a.favorite > b.favorite) return -1;
                            if (a.favorite < b.favorite) return 1;

                            // If 'favorite' values are equal, compare 'label' values alphabetically
                            return a.label.localeCompare(b.label);
                        });

                        // Custom sorting function
                        reports.sort(function(a, b) {
                            // Compare 'global_favorite' values (1 comes before 0)
                            if (a["global_favorite"] > b["global_favorite"]) return -1;
                            if (a["global_favorite"] < b["global_favorite"]) return 1;

                            // Compare 'favorite' values (1 comes before 0)
                            if (a.favorite > b.favorite) return -1;
                            if (a.favorite < b.favorite) return 1;

                            // If 'favorite' values are equal, compare 'label' values alphabetically
                            return a.label.localeCompare(b.label);
                        });
                        frappe.desktop.reports = reports;
                        frappe.desktop.docs = docs;
                    },
                    freeze: false,
                    freeze_message: "Loading"
                });

            }
        }
    },
});