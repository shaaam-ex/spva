$(document).ready(function() {
  function createProgressBar(statusCode) {
    const statuses = [
      { code: 1, label: "Takeoff Uploaded" },
      { code: 2, label: "Estimate Generated" },
      { code: 3, label: "Estimate Published" },
      { code: 4, label: "Estimate Signed" }
    ];

    // Find the index of the current status
    let currentIndex = statuses.findIndex(s => s.code === statusCode);
    if (currentIndex === -1) {
      currentIndex = 0; // Default to the first status if not found
    }

    // Create the progress bar container
    const progressBar = $("<div>").addClass("progress-bar");

    // Create each segment of the progress bar
    statuses.forEach((stage, index) => {
      const segment = $("<div>").addClass("progress-segment");
      segment.text(stage.label);

      if (index <= currentIndex) {
        segment.addClass("completed");
      }

      progressBar.append(segment);
    });

    return progressBar;
  }

  function viewTakeoff(id){
    // make a post to viewTakeoff with takeoff_id: id
    $.post("/viewTakeoff", { takeoff_id: id }, function(data) {
    
      window.location.href = "/viewTakeoff";
      alert("view takeoff " + id+"?");

            console.log(data);

    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Error viewing takeoff:", textStatus, errorThrown);
    });
  }

  function getTakeoffs() {
    console.log("retrieving takeoffs");
    // empty the table
    $("#takeoffs_table").empty();
    $.get("/getTakeoffs", function(data) {
      console.log(data);
      data.forEach(function(takeoff) {
        let row = $("<tr>");
        row.append(`<td>${takeoff.name}</td>`);

        // Create the form for editing
        let form = $("<form>", {
          action: "/editTakeoff",
          method: "POST"
        });

        let input = $("<input>", {
          type: "hidden",
          name: "takeoff_id",
          value: takeoff.id
        });

        let submit = $("<input>", {
          type: "submit",
          value: "Edit"
        });

        form.append(input, submit);

        let tdForm = $("<td>").append(form);
        row.append(tdForm);

        // Format dates using Intl.DateTimeFormat
        let createdAt = new Date(takeoff.created_at).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        });

        row.append(`<td>${createdAt}</td>`);

        // Add the 'View' column with proper event handling
        row.append(`<td><button class="view-button" data-id="${takeoff.id}">View</button></td>`);

        // Create the progress bar cell AFTER the 'View' column
        let tdProgress = $("<td>");
        let progressBar = createProgressBar(takeoff.status);
        tdProgress.append(progressBar);
        row.append(tdProgress);

        $("#takeoffs_table").append(row);
      });
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Error retrieving takeoffs:", textStatus, errorThrown);
    });
  }

  // Bind event handler for dynamically added 'View' buttons
  $(document).on('click', '.view-button', function() {
    const id = $(this).data('id');
    viewTakeoff(id);
  });

  // Initialize the takeoffs table
  getTakeoffs();
});
