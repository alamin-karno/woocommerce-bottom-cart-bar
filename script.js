jQuery(function ($) {
    function showLoading($btn) {
        $btn.prop('disabled', true);
        $btn.find('.cbcb-label').hide();
        $btn.find('.cbcb-loader').show();
    }

    function hideLoading($btn) {
        $btn.prop('disabled', false);
        $btn.find('.cbcb-label').show();
        $btn.find('.cbcb-loader').hide();
    }

    function showWarning(message, scrollToSelector = 'form.cart') {
        $('html, body').animate({ scrollTop: $(scrollToSelector).offset().top - 100 }, 400);
        alert(message);
    }

    function validateFormFields($form) {
        let valid = true;

        $form.find('input, select, textarea').each(function () {
            const $el = $(this);

            // Skip hidden fields and unchecked checkboxes/radio
            if (!$el.is(':visible') || $el.prop('disabled')) return;

            const isRequired = $el.prop('required') || $el.closest('.required').length > 0;

            if (isRequired && !$el.val()) {
                valid = false;
                return false; // break loop
            }
        });

        return valid;
    }

    function submitForm(redirectTo) {
        const $form = $('form.cart');
        const $btn = $(document.activeElement);

        // Validate variation selections
        if ($form.hasClass('variations_form') && $form.find('.variations select').length > 0) {
            let valid = true;
            $form.find('.variations select').each(function () {
                if (!$(this).val()) valid = false;
            });

            if (!valid) {
                showWarning('Please select a product variation before proceeding.', '.variations_form');
                return;
            }
        }

        // Validate all required form inputs
        if (!validateFormFields($form)) {
            showWarning('Please fill all required product fields before adding to cart.');
            return;
        }

        showLoading($btn);

        let formData = $form.serialize();

        if ($form.hasClass('variations_form')) {
            formData = formData.replace(/product_id=[0-9]+&?/g, '');
        }

        $.post(cbcb_params.ajax_url, formData, function () {
            hideLoading($btn);
            window.location.href = redirectTo;
        });
    }

    $('#cbcb-add-to-cart').click(() => submitForm(cbcb_params.cart_url));
    $('#cbcb-buy-now').click(() => submitForm(cbcb_params.checkout_url));

    // Update price on variation change
    $('form.variations_form').on('found_variation', function (event, variation) {
        if (variation && variation.price_html) {
            $('#cbcb-price-container').html(variation.price_html);
        }
    });

    // Sticky Bar visibility based on scroll position
    const stickyBar = $('#cbcb-sticky-bar');

    $(window).on('scroll', function () {
        const scrollPosition = $(window).scrollTop();
        const documentHeight = $(document).height();
        const windowHeight = $(window).height();
        
        if (scrollPosition + windowHeight >= documentHeight) {
            // Scrolled to the bottom
            stickyBar.addClass('cbcb-hidden');
        } else {
            // Not at the bottom
            stickyBar.removeClass('cbcb-hidden');
        }
    });
});
