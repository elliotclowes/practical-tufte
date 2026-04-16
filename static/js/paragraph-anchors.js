/*  Paragraph Anchors — Scripting.com-style # links
 *  Adds a subtle "#" permalink to each paragraph and heading in post content.
 *  IDs are derived from a stable hash of the text, so they survive rebuilds
 *  and only change if the paragraph text itself is edited.
 */
(function () {
	'use strict';

	// djb2 hash — fast, stable, and produces short base-36 IDs
	function hash(str) {
		var h = 5381;
		for (var i = 0; i < str.length; i++) {
			h = ((h << 5) + h) + str.charCodeAt(i);
			h |= 0; // keep 32-bit
		}
		return Math.abs(h).toString(36);
	}

	document.addEventListener('DOMContentLoaded', function () {
		var articles = document.querySelectorAll('article.pt-post');

		articles.forEach(function (article) {
			// On list pages the article carries a data-permalink;
			// on single post pages it does not (anchor is page-local).
			var permalink = article.getAttribute('data-permalink') || '';
			var seen = {};

			var els = article.querySelectorAll(
				'.e-content p, .e-content h1, .e-content h2, .e-content h3, .e-content li'
			);

			els.forEach(function (el) {
				// Skip elements inside sidenotes, margin notes, or non-content areas
				if (el.closest('.sidenote, .marginnote, .post-categories-footer, .email-reply, .conversation-reply, .microblog_conversation')) return;

				// For list items, skip if they contain <p> children (the <p> gets its own anchor)
				if (el.tagName === 'LI' && el.querySelector('p')) return;

				// Skip empty / image-only paragraphs
				var text = el.textContent.trim();
				if (!text || text.length < 3) return;

				// Build a stable ID
				var id = 'p' + hash(text);
				if (seen[id]) { seen[id]++; id += seen[id]; }
				else { seen[id] = 1; }

				el.setAttribute('id', id);

				var a = document.createElement('a');
				a.href = permalink ? (permalink + '#' + id) : ('#' + id);
				a.className = 'para-anchor';
				a.textContent = '\u00A0#';
				a.setAttribute('aria-label', 'Link to this paragraph');
				// For list items with nested lists, insert before the nested list
				// so the # sits next to the parent text, not below the sub-items.
				var nestedList = el.tagName === 'LI'
					? el.querySelector(':scope > ul, :scope > ol')
					: null;
				if (nestedList) {
					el.insertBefore(a, nestedList);
				} else {
					el.appendChild(a);
				}
			});
		});

		// Scroll to target when arriving via a #hash URL
		if (window.location.hash) {
			try {
				var target = document.querySelector(window.location.hash);
				if (target) {
					setTimeout(function () {
						target.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}, 120);
				}
			} catch (e) { /* invalid selector — ignore */ }
		}
	});
})();
