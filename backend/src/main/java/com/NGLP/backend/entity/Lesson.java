public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String videoUrl;

    private int orderIndex;

    public Lesson() {}

    // getters and setters
}