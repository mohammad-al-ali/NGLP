public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long instructorId;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private double price;

    private double discount;

    private double rating;

    private LocalDateTime createdAt;

    public Course() {}

    // getters and setters
}
