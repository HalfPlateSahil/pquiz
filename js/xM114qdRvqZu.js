import { moduleRegistry } from './modules/index.js';

/* To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case */

// eslint-disable-next-line no-extend-native

(function ($, Drupal) {
    String.prototype.toTitleCase = function () {
        'use strict'
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i
        var alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/
        var wordSeparators = /([ :–—-])/

        return this.split(wordSeparators)
            .map(function (current, index, array) {
                if (
                    /* Check for small words */
                    current.search(smallWords) > -1 &&
                    /* Skip first and last word */
                    index !== 0 &&
                    index !== array.length - 1 &&
                    /* Ignore title end and subtitle start */
                    array[index - 3] !== ':' &&
                    array[index + 1] !== ':' &&
                    /* Ignore small words that start a hyphenated phrase */
                    (array[index + 1] !== '-' ||
                        (array[index - 1] === '-' && array[index + 1] === '-'))
                ) {
                    return current.toLowerCase()
                }

                /* Ignore intentional capitalization */
                if (current.substr(1).search(/[A-Z]|\../) > -1) {
                    return current
                }

                /* Ignore URLs */
                if (array[index + 1] === ':' && array[index + 2] !== '') {
                    return current
                }

                /* Capitalize the first letter */
                return current.replace(alphanumericPattern, function (match) {
                    return match.toUpperCase()
                })
            })
            .join('')
    }
    $(document).ready(function () {

        $('.hs-button').each(function (i, v) {
            $('this').css({ "background-color": '#00913a', "border-color": '#00913a' });
            console.log($('this'));
        });

        $('.title-case').each(function (i, v) {
            $('this').text().toTitleCase();
        });

        // Fire modules
        $('[data-module]').each(function (i, v) {
            var name = $(v).data('module');
            if (typeof moduleRegistry[name] === 'function') {
                var module = moduleRegistry[name]($(v));
            }
        });

        // Global back-top-top smooth scroll
        $('[data-action="back-top-top"]').on('click', function (e) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: 0
            },
                500
            );
        });

        // Maintain video embed ratios
        var $videos = $('iframe-disable');
        var $videoContainer = $('iframe-disable').parent();

        $videos.each(function () {
            var noVideo = $(this).hasClass('no-video');
            if (!noVideo) {
                $(this)
                    .data('aspectRatio', this.height / this.width)
                    .removeAttr('height')
                    .removeAttr('width');
            }
        });

        if ($('.section-header-bleed select, .resource-filter select').length > 0) {
            // $('.section-header-bleed select, .resource-filter select').customSelect();
            $('.section-header-bleed select, .resource-filter select').addClass(
                'custom-select'
            );
        }

        $(window)
            .resize(function () {
                var newWidth = $videoContainer.width();
                $videos.each(function () {
                    var $el = $(this);
                    var noVideo = $el.hasClass('no-video');
                    if (!noVideo) {
                        $el.width(newWidth).height(newWidth * $el.data('aspectRatio'));
                    }
                });
                $('.section-header-bleed select, .resource-filter select').trigger(
                    'render'
                );
            })
            .resize();

        function getParameterByName(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
                results = regex.exec(location.search);
            return results === null ?
                '' :
                decodeURIComponent(results[1].replace(/\+/g, ' '));
        }

        // Google Nuber Snippet
        (function (a, e, c, f, g, b, d) {
            var h = { ak: '1070723572', cl: 'ComkCKv_iV0Q9OPH_gM' };
            a[c] =
                a[c] ||
                function () {
                    (a[c].q = a[c].q || []).push(arguments);
                };
            a[f] || (a[f] = h.ak);
            b = e.createElement(g);
            b.async = 1;
            b.src = '//www.gstatic.com/wcm/loader.js';
            d = e.getElementsByTagName(g)[0];
            d.parentNode.insertBefore(b, d);
            a._googWcmGet = function (b, d, e) {
                a[c](2, b, h, d, null, new Date(), e);
            };
        })(window, document, '_googWcmImpl', '_googWcmAk', 'script');
        //End Google number snippet

        _googWcmGet('google-phone', '413.448.3152');

        // Custom Google Analytics Events

        // calendar -- only record for checking a filter
        $('.calendar__sidebar .accordion--calendar input:checkbox').click(function () {
            if ($(this).is(':checked')) {
                var category = $(this)
                    .closest('.item-list')
                    .parent()
                    .find('h2')
                    .text();
                var selection = $(this)
                    .parent()
                    .find('a')
                    .text();
                var psel = selection.substring(0, selection.indexOf(' ('));
                var exploreby = $(this)
                    .closest('.accordion--calendar')
                    .prev('h3')
                    .text();

                // send to GA
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'ga_event',
                    ga_event: {
                        category: 'Calendar Filter',
                        action: exploreby + ' | ' + category,
                        label: psel
                    }
                });
            }
        });

        // 404
        if ($('h1:contains("404 - Page Not Found")').length) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'ga_event',
                ga_event: {
                    category: '404 Page Not Found',
                    action: location.pathname,
                    label: 'undefined'
                }
            });
        }

        // resources
        if ($('.resource-filter').length) {
            var category = $('#edit-im-field-resource-category option:selected:not(:contains("Resources by Category"))').text();
            var type = $('#edit-im-field-resource-type option:selected:not(:contains("Resources by Type"))').text();
            var keyword = $('input[name=keyword]').val();

            // Update form after selecting options
            var categorySelect = document.getElementById('edit-im-field-resource-category');
            if (categorySelect) {
                categorySelect.addEventListener('change', function () {
                    this.form.submit();
                });
            }

            var typeSelect = document.getElementById('edit-im-field-resource-type');
            if (typeSelect) {
                typeSelect.addEventListener('change', function () {
                    this.form.submit();
                });
            }
            // send to GA
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'virtualPageView',
                virtualPageView: {
                    virtualPageURL: '/resources/' + category + '/' + type + '/' + keyword,
                    virtualPageTitle: 'Resource Search'
                }
            });
        }

        // no results on search page
        if ($('.page-search .filtering-by span').text() == 'Showing 0 results for') {
            var keyword = $('.page-search #edit-keys-1--2').val();

            // send to GA
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'ga_event',
                ga_event: {
                    category: 'Zero Results',
                    action: keyword,
                    label: 'undefined'
                }
            });
        }

        // adjust table of contents scroll on privacy page to account for header
        $('#tos a').click(function () {
            var targetDiv = $(this).attr('href');
            var panelOffset = $(targetDiv).offset().top;
            var windowTop = window.pageYOffset + $('.global-header').height() + 36; //arbitrary padding
            $('html, body').animate({
                scrollTop: panelOffset - $('.global-header').height() - 48 //arbitrary padding
            }, {
                duration: 500
            });
            return false;
        });

        // resources detail pages
        if ($('.node-type-resource').length > 0) {
            const $contentTeasers = $('.paragraphs-item-content-teaser');

            $contentTeasers.each(function (index, element) {
                const $button = $(element).find('[data-role="button"]');
                const $teaser = $(element).find('.node.view-mode-content_teaser');
                $button.appendTo($teaser);
            });
        }

        /**
         * Women's Week
         *
         * @TODO: Move this into a custom module or some other best practice method if this funcitonality is used more than once
         */
        if ($('#hs_cos_wrapper').length) {
            var o = {
                init: function () {
                    console.log('init');
                    document.getElementsByClassName('isg-agenda').length > 0 &&
                        (document
                            .querySelector('.isg-agenda__tabs li')
                            .classList.add('active'),
                            document
                                .querySelector('.isg-agenda__content ul')
                                .classList.add('active'),
                            o.eventBindings());
                },
                eventBindings: function () {
                    console.log('bindings');
                    var t = document.querySelectorAll('.isg-agenda__tabs li'),
                        e = document.querySelectorAll('.isg-agenda__content ul');
                    $(t).each(function () {
                        console.log('adding listener');
                        $(this).click(function (n) {
                            console.log('clicked');
                            var i = n.currentTarget.dataset ?
                                n.currentTarget.dataset.tab :
                                n.currentTarget.getAttribute('data-tab');
                            t.forEach(function (t, n) {
                                parseFloat(i) === n + 1 ?
                                    (t.classList.add('active'), e[n].classList.add('active')) :
                                    (t.classList.remove('active'),
                                        e[n].classList.remove('active'));
                            });
                        });
                    });
                }
            };
            o.init();
            o.eventBindings();
        }
    });

  /**
   * Gets the value of a query parameter into the current URL.
   *
   * @param {String} key
   *   The name of the query parameter.
   * @returns {String}
   *   The value of the query parameter if it exists, empty otherwise.
   */
  function getQueryParameter(key) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(key)) {
      return urlParams.get(key);
    }

    return '';
  }
  /**
   * Loads the search keyword query parameter and inject it into the
   * search results count message.
   */
  Drupal.behaviors.kripaluSearchResults = {
    attach: function (context, settings) {
      once('kripaluSearchResults', 'body.path-search .page-content', context).forEach(function (element) {
        const $searchPage = $(element);
        const $searchKeyTag = $searchPage.find('#search-key-tag');
        const search_key = getQueryParameter('keys');
        if ($searchKeyTag.length > 0) {
          $searchKeyTag.text(search_key + '.');
        }

        // Load total and current page info from nav pager data attributes.
        const $pagerElem = $searchPage.find('nav.pager');
        if ($pagerElem.length > 0) {
          const total_count = $pagerElem.attr('data-total-count');
          const $totalCountTag = $searchPage.find('#search-count--total');
          if ($totalCountTag.length > 0) {
            $totalCountTag.text(total_count);
          }

          const items_per_page = $pagerElem.attr('data-items-per-page');
          const current_page = $pagerElem.attr('data-current-page');

          const $startCountTag = $searchPage.find('#search-count--start');
          if ($startCountTag.length > 0) {
            $startCountTag.text(((current_page-1) * items_per_page + 1) + ' - ');
          }

          const $endCountTag = $searchPage.find('#search-count--end');
          if ($endCountTag.length > 0) {
            let end_count = current_page * items_per_page;
            if (end_count > total_count) {
              end_count = total_count;
            }
            $endCountTag.text(end_count + ' of ');
          }
        }
      });
    }
  };

})(jQuery, Drupal);
